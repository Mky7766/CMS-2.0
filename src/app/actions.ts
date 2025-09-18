
"use server"

import fs from "fs/promises";
import path from "path";
import { redirect } from 'next/navigation';
import { User, users, setUsers, posts, setPosts, Post, Menu, Template, Page, pages, setPages, Category, categories, setCategories } from "@/lib/data";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { revalidatePath, revalidateTag } from "next/cache";
import { ImagePlaceholder } from "@/lib/placeholder-images";
import { SiteSettings } from "@/lib/data";
import { cache } from 'react'


// In-memory cache for settings
let cachedSettings: SiteSettings | null = null;

export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (cachedSettings) {
    return cachedSettings;
  }

  try {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'settings.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const settings = JSON.parse(data) as SiteSettings;
    cachedSettings = settings;
    return settings;
  } catch (error) {
    // If the file doesn't exist or is invalid, return default settings
    console.warn("settings.json not found or invalid, using default settings.");
    const defaultSettings: SiteSettings = {
      siteName: "Vinee CMS",
      tagline: "A modern, git-based CMS",
      logo: "https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600",
      footerText: "Built with ❤️ by the open-source community.",
      blogTemplate: "grid"
    };
    return defaultSettings;
  }
});

export async function clearSettingsCache(): Promise<void> {
    cachedSettings = null;
    revalidateTag('settings');
}


export async function signup(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email and password are required.' };
    }

    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return { error: 'User with this email already exists.' };
    }

    const newUser: User = {
        id: (users.length + 1).toString(),
        name: email.split('@')[0],
        email,
        password, // In a real app, hash and salt this password!
        avatarUrl: `https://picsum.photos/seed/${users.length + 1}/32/32`,
        role: 'Author',
        createdAt: new Date().toISOString().split('T')[0],
    };

    const updatedUsers = [...users, newUser];
    
    try {
        const usersFilePath = path.join(process.cwd(), 'src', 'lib', 'users.json');
        await fs.writeFile(usersFilePath, JSON.stringify(updatedUsers, null, 2));
        setUsers(updatedUsers); // Update the in-memory user list
    } catch (error) {
        console.error("Failed to save user:", error);
        return { error: 'Failed to create account. Please try again.' };
    }
    
    await createSession(newUser.id);
    redirect('/admin/dashboard');
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email and password are required.' };
    }

    const user = users.find(user => user.email === email);

    if (!user || user.password !== password) {
        return { error: 'Invalid email or password.' };
    }

    await createSession(user.id);
    redirect('/admin/dashboard');
}

export async function logout() {
    await deleteSession();
    redirect('/login');
}

export async function savePost(prevState: any, formData: FormData) {
    // This is a simplified example. In a real app, you'd do more validation.
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const permalink = formData.get('permalink') as string;
    const status = formData.get('status') as 'Published' | 'Draft' | 'Scheduled';
    const featuredImageUrl = formData.get('featured-image-url') as string;
    const tags = (formData.get('tags-hidden') as string).split(',').filter(t => t.trim() !== '');
    const categoryId = formData.get('category-id') as string;

    const session = await getSession();
    if (!session?.userId) {
        return { error: "You must be logged in to create a post." };
    }

    const author = users.find(u => u.id === session.userId);
    if (!author) {
        return { error: "Author not found." };
    }

    // Check for duplicate permalink/ID
    if (posts.some(p => p.id === permalink)) {
        return { error: `A post with the permalink "${permalink}" already exists.` };
    }
    

    const newPost: Post = {
        id: permalink,
        title,
        content,
        status,
        createdAt: new Date().toISOString().split('T')[0],
        author: {
            name: author.name,
            avatarUrl: author.avatarUrl,
        },
        authorId: author.id,
        categoryId,
        tags,
    };
    
    if (featuredImageUrl) {
        newPost.featuredImage = {
            url: featuredImageUrl,
            alt: title,
        }
    }

    const updatedPosts = [...posts, newPost];

    try {
        const postsFilePath = path.join(process.cwd(), 'src', 'lib', 'posts.json');
        await fs.writeFile(postsFilePath, JSON.stringify(updatedPosts, null, 2));
        setPosts(updatedPosts);
    } catch (error) {
        console.error("Failed to save post:", error);
        return { error: "Could not save the post. Please try again." };
    }
    
    revalidatePath('/');
    revalidatePath(`/${permalink}`);
    redirect('/admin/posts');
}


export async function updatePost(prevState: any, formData: FormData) {
    const postId = formData.get('postId') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const permalink = formData.get('permalink') as string;
    const status = formData.get('status') as 'Published' | 'Draft' | 'Scheduled';
    const featuredImageUrl = formData.get('featured-image-url') as string;
    const tags = (formData.get('tags-hidden') as string).split(',').filter(t => t.trim() !== '');
    const categoryId = formData.get('category-id') as string;

    const session = await getSession();
    if (!session?.userId) {
        return { error: "You must be logged in to update a post." };
    }

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) {
        return { error: "Post not found." };
    }

    // Check if the new permalink conflicts with another post
    if (permalink !== postId && posts.some(p => p.id === permalink)) {
        return { error: `A post with the permalink "${permalink}" already exists.` };
    }

    const updatedPost = { ...posts[postIndex] };
    updatedPost.id = permalink;
    updatedPost.title = title;
    updatedPost.content = content;
    updatedPost.status = status;
    updatedPost.tags = tags;
    updatedPost.categoryId = categoryId;
    
    if (featuredImageUrl) {
        updatedPost.featuredImage = {
            url: featuredImageUrl,
            alt: title,
        }
    } else {
        delete updatedPost.featuredImage;
    }

    const updatedPosts = [...posts];
    updatedPosts[postIndex] = updatedPost;

    try {
        const postsFilePath = path.join(process.cwd(), 'src', 'lib', 'posts.json');
        await fs.writeFile(postsFilePath, JSON.stringify(updatedPosts, null, 2));
        setPosts(updatedPosts);
    } catch (error) {
        console.error("Failed to update post:", error);
        return { error: "Could not update the post. Please try again." };
    }

    revalidatePath('/');
    revalidatePath(`/${postId}`);
    revalidatePath(`/${permalink}`);
    redirect('/admin/posts');
}

export async function deletePost(postId: string) {
    const session = await getSession();
    if (!session?.userId) {
        // In a real app, you'd also check for roles/permissions
        return { error: "You are not authorized to delete this post." };
    }

    const updatedPosts = posts.filter(p => p.id !== postId);

    try {
        const postsFilePath = path.join(process.cwd(), 'src', 'lib', 'posts.json');
        await fs.writeFile(postsFilePath, JSON.stringify(updatedPosts, null, 2));
        setPosts(updatedPosts);
    } catch (error) {
        console.error("Failed to delete post:", error);
        return { error: "Could not delete the post. Please try again." };
    }
    
    revalidatePath('/');
    revalidatePath(`/admin/posts`);
    revalidatePath(`/${postId}`);
    return { success: "Post deleted successfully." };
}

export async function createPage(prevState: any, formData: FormData) {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const permalink = formData.get('permalink') as string;
    const status = formData.get('status') as 'Published' | 'Draft';

    const session = await getSession();
    if (!session?.userId) {
        return { error: "You must be logged in to create a page." };
    }

    if (pages.some(p => p.id === permalink)) {
        return { error: `A page with the permalink "${permalink}" already exists.` };
    }

    const newPage: Page = {
        id: permalink,
        title,
        content,
        status,
        createdAt: new Date().toISOString().split('T')[0],
        authorId: session.userId,
    };

    const updatedPages = [...pages, newPage];

    try {
        const pagesFilePath = path.join(process.cwd(), 'src', 'lib', 'pages.json');
        await fs.writeFile(pagesFilePath, JSON.stringify(updatedPages, null, 2));
        setPages(updatedPages);
    } catch (error) {
        return { error: "Could not save the page. Please try again." };
    }

    revalidatePath(`/${permalink}`);
    revalidatePath('/admin/pages');
    redirect('/admin/pages');
}

export async function updatePage(prevState: any, formData: FormData) {
    const pageId = formData.get('pageId') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const permalink = formData.get('permalink') as string;
    const status = formData.get('status') as 'Published' | 'Draft';

    const session = await getSession();
    if (!session?.userId) {
        return { error: "You must be logged in to update a page." };
    }

    const pageIndex = pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) {
        return { error: "Page not found." };
    }

    if (permalink !== pageId && pages.some(p => p.id === permalink)) {
        return { error: `A page with the permalink "${permalink}" already exists.` };
    }

    const updatedPage = { ...pages[pageIndex] };
    updatedPage.id = permalink;
    updatedPage.title = title;
    updatedPage.content = content;
    updatedPage.status = status;

    const updatedPages = [...pages];
    updatedPages[pageIndex] = updatedPage;

    try {
        const pagesFilePath = path.join(process.cwd(), 'src', 'lib', 'pages.json');
        await fs.writeFile(pagesFilePath, JSON.stringify(updatedPages, null, 2));
        setPages(updatedPages);
    } catch (error) {
        return { error: "Could not update the page. Please try again." };
    }

    revalidatePath(`/${pageId}`);
    revalidatePath(`/${permalink}`);
    revalidatePath('/admin/pages');
    redirect('/admin/pages');
}

export async function deletePage(pageId: string) {
    const session = await getSession();
    if (!session?.userId) {
        return { error: "You are not authorized to delete this page." };
    }

    const updatedPages = pages.filter(p => p.id !== pageId);

    try {
        const pagesFilePath = path.join(process.cwd(), 'src', 'lib', 'pages.json');
        await fs.writeFile(pagesFilePath, JSON.stringify(updatedPages, null, 2));
        setPages(updatedPages);
    } catch (error) {
        return { error: "Could not delete the page. Please try again." };
    }

    revalidatePath(`/admin/pages`);
    revalidatePath(`/${pageId}`);
    return { success: "Page deleted successfully." };
}

export async function getPages(): Promise<Page[]> {
    const pagesPath = path.join(process.cwd(), 'src', 'lib', 'pages.json');
    try {
        const file = await fs.readFile(pagesPath, 'utf-8');
        return JSON.parse(file) as Page[];
    } catch (error) {
        return [];
    }
}

export async function getPage(pageId: string): Promise<Page | undefined> {
    const allPages = await getPages();
    return allPages.find(p => p.id === pageId);
}


export async function uploadMedia(dataUrl: string, fileName: string) {
    const session = await getSession();
    if (!session?.userId) {
        return { error: "You must be logged in to upload media." };
    }

    const placeholderDataPath = path.join(process.cwd(), 'src', 'lib', 'placeholder-images.json');

    try {
        const file = await fs.readFile(placeholderDataPath, 'utf-8');
        const data = JSON.parse(file);
        
        const newImage: ImagePlaceholder = {
            id: `media-${Date.now()}`,
            description: fileName,
            imageUrl: dataUrl,
            imageHint: 'custom upload'
        };

        data.placeholderImages.unshift(newImage); // Add to the beginning

        await fs.writeFile(placeholderDataPath, JSON.stringify(data, null, 2));
        
        return { success: "Image uploaded successfully.", newImage };
    } catch (error) {
        console.error("Error uploading media:", error);
        return { error: "Failed to upload image." };
    }
}

export async function deleteMedia(imageId: string) {
    const session = await getSession();
    if (!session?.userId) {
        return { error: "You must be logged in to delete media." };
    }

    const placeholderDataPath = path.join(process.cwd(), 'src', 'lib', 'placeholder-images.json');
    try {
        const file = await fs.readFile(placeholderDataPath, 'utf-8');
        const data = JSON.parse(file);
        
        const initialLength = data.placeholderImages.length;
        data.placeholderImages = data.placeholderImages.filter((img: ImagePlaceholder) => img.id !== imageId);

        if (data.placeholderImages.length === initialLength) {
            return { error: "Image not found." };
        }

        await fs.writeFile(placeholderDataPath, JSON.stringify(data, null, 2));

        return { success: "Image deleted successfully." };
    } catch (error) {
        console.error("Error deleting media:", error);
        return { error: "Failed to delete image." };
    }
}


export async function getImages(): Promise<ImagePlaceholder[]> {
    const placeholderDataPath = path.join(process.cwd(), 'src', 'lib', 'placeholder-images.json');
    try {
        const file = await fs.readFile(placeholderDataPath, 'utf-8');
        const data = JSON.parse(file);
        return data.placeholderImages as ImagePlaceholder[];
    } catch (error) {
        console.error("Error fetching images:", error);
        return [];
    }
}

export async function updateSettings(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session?.userId) {
        return { error: "You are not authorized to perform this action." };
    }
    // TODO: In a real app, check if the user has the 'Admin' role.

    const settingsPath = path.join(process.cwd(), 'src', 'lib', 'settings.json');
    try {
        const currentSettings = await getSettings();

        const updatedSettings: SiteSettings = {
            ...currentSettings,
            siteName: formData.has('site-name') ? formData.get('site-name') as string : currentSettings.siteName,
            tagline: formData.has('tagline') ? formData.get('tagline') as string : currentSettings.tagline,
            faviconUrl: formData.has('favicon-url') ? formData.get('favicon-url') as string : currentSettings.faviconUrl,
            headerMenuId: formData.has('header-menu-id') ? formData.get('header-menu-id') as string : currentSettings.headerMenuId,
            footerMenuId: formData.has('footer-menu-id') ? formData.get('footer-menu-id') as string : currentSettings.footerMenuId,
            footerText: formData.has('footer-text') ? formData.get('footer-text') as string : currentSettings.footerText,
            blogTemplate: formData.has('blog-template') ? formData.get('blog-template') as string : currentSettings.blogTemplate,
            adsTxt: formData.has('ads-txt') ? formData.get('ads-txt') as string : currentSettings.adsTxt,
            robotsTxt: formData.has('robots-txt') ? formData.get('robots-txt') as string : currentSettings.robotsTxt,
            defaultPostCategoryId: formData.has('default-category-id') ? formData.get('default-category-id') as string : currentSettings.defaultPostCategoryId,
            defaultPostFormat: formData.has('default-post-format') ? formData.get('default-post-format') as string : currentSettings.defaultPostFormat,
            customHeadCode: formData.has('custom-head-code') ? formData.get('custom-head-code') as string : currentSettings.customHeadCode,
            customBodyCode: formData.has('custom-body-code') ? formData.get('custom-body-code') as string : currentSettings.customBodyCode,
            theme: {
                ...currentSettings.theme,
                primary: formData.has('theme-primary') ? formData.get('theme-primary') as string : currentSettings.theme?.primary,
                accent: formData.has('theme-accent') ? formData.get('theme-accent') as string : currentSettings.theme?.accent,
                background: formData.has('theme-background') ? formData.get('theme-background') as string : currentSettings.theme?.background,
            }
        };

        await fs.writeFile(settingsPath, JSON.stringify(updatedSettings, null, 2));
        
        await clearSettingsCache();
        revalidatePath('/', 'layout');
        revalidatePath('/ads.txt');
        revalidatePath('/robots.txt');
        revalidatePath('/sitemap.xml');
        revalidatePath('/admin/appearance/templates');
        revalidatePath('/admin/appearance/customize');


        return { success: "Settings updated successfully." };

    } catch (error) {
        console.error("Error updating settings:", error);
        return { error: "Failed to update settings." };
    }
}


export async function createUser(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session?.userId) {
        return { error: "You are not authorized to perform this action." };
    }

    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as User['role'];

    if (!email || !name || !password || !role) {
        return { error: 'All fields are required.' };
    }

    if (users.find(u => u.email === email)) {
        return { error: 'A user with this email already exists.' };
    }

    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        password, // Don't forget to hash passwords in a real app!
        role,
        avatarUrl: `https://picsum.photos/seed/user-${Date.now()}/32/32`,
        createdAt: new Date().toISOString().split('T')[0],
    };

    const updatedUsers = [...users, newUser];
    try {
        const usersFilePath = path.join(process.cwd(), 'src', 'lib', 'users.json');
        await fs.writeFile(usersFilePath, JSON.stringify(updatedUsers, null, 2));
        setUsers(updatedUsers);
    } catch (error) {
        console.error("Failed to create user:", error);
        return { error: 'Failed to save user.' };
    }

    revalidatePath('/admin/users');
    redirect('/admin/users');
}


export async function adminUpdateUser(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session?.userId) { return { error: "Unauthorized." }; }

    const userId = formData.get('userId') as string;
    const name = formData.get('name') as string;
    const role = formData.get('role') as User['role'];

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return { error: "User not found." };
    }

    const updatedUsers = [...users];
    updatedUsers[userIndex] = { ...updatedUsers[userIndex], name, role };
    
    try {
        const usersFilePath = path.join(process.cwd(), 'src', 'lib', 'users.json');
        await fs.writeFile(usersFilePath, JSON.stringify(updatedUsers, null, 2));
        setUsers(updatedUsers);
    } catch (error) {
        return { error: "Failed to update user." };
    }

    revalidatePath('/admin/users');
    redirect('/admin/users');
}


export async function updateUser(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session?.userId) {
        return { error: "You must be logged in to update your profile." };
    }

    const name = formData.get('name') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    const userIndex = users.findIndex(u => u.id === session.userId);
    if (userIndex === -1) {
        return { error: "User not found." };
    }

    const updatedUsers = [...users];
    const userToUpdate = { ...updatedUsers[userIndex] };
    
    userToUpdate.name = name;

    if (password) {
        if (password !== confirmPassword) {
            return { error: "Passwords do not match." };
        }
        userToUpdate.password = password; // Hash in a real app
    }
    
    updatedUsers[userIndex] = userToUpdate;

    try {
        const usersFilePath = path.join(process.cwd(), 'src', 'lib', 'users.json');
        await fs.writeFile(usersFilePath, JSON.stringify(updatedUsers, null, 2));
        setUsers(updatedUsers);
    } catch (error) {
        return { error: "Failed to update profile." };
    }

    revalidatePath('/admin/profile');
    return { success: "Profile updated successfully." };
}


export async function updateUserAvatar(userId: string, dataUrl: string) {
    const session = await getSession();
    if (!session?.userId || session.userId !== userId) {
        return { error: "Unauthorized." };
    }

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return { error: "User not found." };
    }

    const updatedUsers = [...users];
    updatedUsers[userIndex].avatarUrl = dataUrl;

    try {
        const usersFilePath = path.join(process.cwd(), 'src', 'lib', 'users.json');
        await fs.writeFile(usersFilePath, JSON.stringify(updatedUsers, null, 2));
        setUsers(updatedUsers);
    } catch (error) {
        return { error: "Failed to update avatar." };
    }

    revalidatePath('/admin/profile');
    revalidatePath('/admin');
    return { success: "Avatar updated.", newAvatarUrl: dataUrl };
}

export async function deleteUser(userId: string) {
    const session = await getSession();
    if (!session?.userId) { return { error: "Unauthorized." }; }
    
    // Prevent user from deleting themselves
    if (session.userId === userId) {
        return { error: "You cannot delete your own account." };
    }

    const updatedUsers = users.filter(u => u.id !== userId);
    // Also delete user's posts
    const updatedPosts = posts.filter(p => p.authorId !== userId);

    try {
        const usersFilePath = path.join(process.cwd(), 'src', 'lib', 'users.json');
        await fs.writeFile(usersFilePath, JSON.stringify(updatedUsers, null, 2));
        setUsers(updatedUsers);
        
        const postsFilePath = path.join(process.cwd(), 'src', 'lib', 'posts.json');
        await fs.writeFile(postsFilePath, JSON.stringify(updatedPosts, null, 2));
        setPosts(updatedPosts);
    } catch (error) {
        return { error: "Failed to delete user and their posts." };
    }

    revalidatePath('/admin/users');
    revalidatePath('/');
    return { success: "User deleted successfully." };
}

export async function getUserById(userId: string) {
    return users.find(u => u.id === userId) || null;
}

export async function getUsersClient() {
    // This is a client-safe version that doesn't expose passwords
    return users.map(({ password, ...user }) => user);
}


export async function saveMenu(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session?.userId) { return { error: "Unauthorized." }; }

    const menuName = formData.get('menu-name') as string;
    const labels = formData.getAll('item-labels') as string[];
    const urls = formData.getAll('item-urls') as string[];
    const location = formData.get('menu-location') as string;

    if (!menuName) {
        return { error: "Menu name is required." };
    }

    const newMenu: Menu = {
        id: `${Date.now()}`,
        name: menuName,
        items: labels.map((label, index) => ({ label, url: urls[index] })),
    };

    const menusPath = path.join(process.cwd(), 'src', 'lib', 'menus.json');
    
    try {
        let allMenus: Menu[] = [];
        try {
            const file = await fs.readFile(menusPath, 'utf-8');
            allMenus = JSON.parse(file);
        } catch (readError) {
            // File doesn't exist, start with an empty array
        }

        allMenus.push(newMenu);
        await fs.writeFile(menusPath, JSON.stringify(allMenus, null, 2));

        // If a location was selected, update settings.json
        if (location === 'header' || location === 'footer') {
            const settingsPath = path.join(process.cwd(), 'src', 'lib', 'settings.json');
            const settingsFile = await fs.readFile(settingsPath, 'utf-8');
            const settings = JSON.parse(settingsFile);
            
            if (location === 'header') {
                settings.headerMenuId = newMenu.id;
            } else if (location === 'footer') {
                settings.footerMenuId = newMenu.id;
            }

            await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
            await clearSettingsCache();
            revalidatePath('/', 'layout');
        }

    } catch (error) {
        console.error("Error saving menu:", error);
        return { error: "Failed to save menu." };
    }

    revalidatePath('/admin/menus');
    redirect('/admin/menus');
}


export async function updateMenu(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session?.userId) { return { error: "Unauthorized." }; }

    const menuId = formData.get('menu-id') as string;
    const menuName = formData.get('menu-name') as string;
    const labels = formData.getAll('item-labels') as string[];
    const urls = formData.getAll('item-urls') as string[];
    const location = formData.get('menu-location') as string;

    const menusPath = path.join(process.cwd(), 'src', 'lib', 'menus.json');

    try {
        const file = await fs.readFile(menusPath, 'utf-8');
        const allMenus: Menu[] = JSON.parse(file);
        
        const menuIndex = allMenus.findIndex(m => m.id === menuId);
        if (menuIndex === -1) {
            return { error: "Menu not found." };
        }

        allMenus[menuIndex] = {
            id: menuId,
            name: menuName,
            items: labels.map((label, index) => ({ label, url: urls[index] })),
        };

        await fs.writeFile(menusPath, JSON.stringify(allMenus, null, 2));

        const settingsPath = path.join(process.cwd(), 'src', 'lib', 'settings.json');
        const settingsFile = await fs.readFile(settingsPath, 'utf-8');
        const settings = JSON.parse(settingsFile);

        // Clear old assignment if it exists
        if (settings.headerMenuId === menuId) delete settings.headerMenuId;
        if (settings.footerMenuId === menuId) delete settings.footerMenuId;
        
        // Set new assignment
        if (location === 'header') settings.headerMenuId = menuId;
        if (location === 'footer') settings.footerMenuId = menuId;

        await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
        await clearSettingsCache();

    } catch (error) {
        console.error("Error updating menu:", error);
        return { error: "Failed to update menu." };
    }

    revalidatePath('/', 'layout');
    revalidatePath('/admin/menus');
    redirect('/admin/menus');
}


export async function deleteMenu(menuId: string) {
    const session = await getSession();
    if (!session?.userId) { return { error: "Unauthorized." }; }

    const menusPath = path.join(process.cwd(), 'src', 'lib', 'menus.json');
    try {
        const file = await fs.readFile(menusPath, 'utf-8');
        let allMenus: Menu[] = JSON.parse(file);
        
        allMenus = allMenus.filter(m => m.id !== menuId);
        await fs.writeFile(menusPath, JSON.stringify(allMenus, null, 2));
        
        // Check if this menu was used in settings and clear it
        const settingsPath = path.join(process.cwd(), 'src', 'lib', 'settings.json');
        const settingsFile = await fs.readFile(settingsPath, 'utf-8');
        const settings = JSON.parse(settingsFile);

        let settingsChanged = false;
        if (settings.headerMenuId === menuId) {
            settings.headerMenuId = 'none';
            settingsChanged = true;
        }
        if (settings.footerMenuId === menuId) {
            settings.footerMenuId = 'none';
            settingsChanged = true;
        }
        
        if (settingsChanged) {
            await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
            await clearSettingsCache();
        }

    } catch (error) {
        console.error("Error deleting menu:", error);
        return { error: "Failed to delete menu." };
    }

    revalidatePath('/admin/menus');
    revalidatePath('/', 'layout');
    return { success: "Menu deleted successfully." };
}

export async function getMenus(): Promise<Menu[]> {
    const menusPath = path.join(process.cwd(), 'src', 'lib', 'menus.json');
    try {
        const file = await fs.readFile(menusPath, 'utf-8');
        return JSON.parse(file) as Menu[];
    } catch (error) {
        return [];
    }
}

export async function getTemplates(): Promise<Template[]> {
    const templatesPath = path.join(process.cwd(), 'src', 'lib', 'templates.json');
    try {
        const file = await fs.readFile(templatesPath, 'utf-8');
        const data = JSON.parse(file);
        return data as Template[];
    } catch (error) {
        // If file doesn't exist, return an empty array
        return [];
    }
}

export async function deleteTemplate(templateId: string) {
    const session = await getSession();
    if (!session?.userId) {
        return { error: "You are not authorized to perform this action." };
    }

    const templatesPath = path.join(process.cwd(), 'src', 'lib', 'templates.json');
    try {
        const templates = await getTemplates();
        const updatedTemplates = templates.filter(t => t.id !== templateId);
        
        if (templates.length === updatedTemplates.length) {
            return { error: "Template not found." };
        }

        await fs.writeFile(templatesPath, JSON.stringify(updatedTemplates, null, 2));

        revalidatePath('/admin/appearance/templates');
        return { success: "Template deleted successfully." };
    } catch (error) {
        console.error("Error deleting template:", error);
        return { error: "Failed to delete template." };
    }
}


export async function getCategories(): Promise<Category[]> {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'categories.json');
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data) as Category[];
    } catch (error) {
        return [];
    }
}

export async function createCategory(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session?.userId) return { error: "Unauthorized." };

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;

    if (!name || !slug) return { error: "Name and slug are required." };

    const currentCategories = await getCategories();
    if (currentCategories.some(c => c.slug === slug)) {
        return { error: `A category with the slug "${slug}" already exists.` };
    }
    
    const newCategory: Category = { id: `cat-${Date.now()}`, name, slug };
    const updatedCategories = [...currentCategories, newCategory];

    try {
        const filePath = path.join(process.cwd(), 'src', 'lib', 'categories.json');
        await fs.writeFile(filePath, JSON.stringify(updatedCategories, null, 2));
        setCategories(updatedCategories);
    } catch (error) {
        return { error: "Failed to create category." };
    }
    
    revalidatePath('/admin/categories');
    return { success: "Category created successfully." };
}

export async function updateCategory(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session?.userId) return { error: "Unauthorized." };

    const categoryId = formData.get('categoryId') as string;
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    
    const currentCategories = await getCategories();
    const categoryIndex = currentCategories.findIndex(c => c.id === categoryId);

    if (categoryIndex === -1) return { error: "Category not found." };
    if (currentCategories.some(c => c.slug === slug && c.id !== categoryId)) {
        return { error: `A category with the slug "${slug}" already exists.` };
    }

    const updatedCategories = [...currentCategories];
    updatedCategories[categoryIndex] = { ...updatedCategories[categoryIndex], name, slug };

    try {
        const filePath = path.join(process.cwd(), 'src', 'lib', 'categories.json');
        await fs.writeFile(filePath, JSON.stringify(updatedCategories, null, 2));
        setCategories(updatedCategories);
    } catch (error) {
        return { error: "Failed to update category." };
    }

    revalidatePath('/admin/categories');
    return { success: "Category updated successfully." };
}

export async function deleteCategory(categoryId: string) {
    const session = await getSession();
    if (!session?.userId) return { error: "Unauthorized." };
    
    // Prevent deleting the 'uncategorized' category
    if (categoryId === 'uncategorized') {
        return { error: "The default 'Uncategorized' category cannot be deleted." };
    }

    const currentCategories = await getCategories();
    const updatedCategories = currentCategories.filter(c => c.id !== categoryId);

    try {
        const filePath = path.join(process.cwd(), 'src', 'lib', 'categories.json');
        await fs.writeFile(filePath, JSON.stringify(updatedCategories, null, 2));
        setCategories(updatedCategories);
    } catch (error) {
        return { error: "Failed to delete category." };
    }

    revalidatePath('/admin/categories');
    return { success: "Category deleted successfully." };
}
