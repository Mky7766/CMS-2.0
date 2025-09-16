

"use server"

import { customizeTheme } from "@/ai/flows/theme-customization";
import fs from "fs/promises";
import path from "path";
import { redirect } from 'next/navigation';
import { User, users, setUsers, posts, setPosts, Post } from "@/lib/data";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { ImagePlaceholder } from "@/lib/placeholder-images";
import { SiteSettings, getSettings, clearSettingsCache } from "@/lib/settings";

export async function applyTheme(customThemeCss: string) {
    try {
        const defaultThemePath = path.join(process.cwd(), 'src', 'app', 'globals.css');
        const defaultThemeCss = await fs.readFile(defaultThemePath, 'utf-8');

        const result = await customizeTheme({
            customThemeCss,
            defaultThemeCss,
        });

        return result;

    } catch (error) {
        console.error("Error applying theme:", error);
        return { themeCss: "" };
    }
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

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        await createSession(user.id);
        redirect('/admin/dashboard');
    } else {
        return { error: 'Invalid email or password.' };
    }
}

export async function logout() {
    await deleteSession();
    redirect('/login');
}


export async function savePost(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session || !session.userId) {
        return { error: "You must be logged in to create a post." };
    }
    
    const user = users.find(u => u.id === session.userId);
    if (!user) {
        return { error: "User not found." };
    }

    const permalink = formData.get('permalink') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const status = formData.get('status') as 'Draft' | 'Published' | 'Scheduled';
    const featuredImageUrl = formData.get('featured-image-url') as string;

    if (!title || !content || !status || !permalink) {
        return { error: 'Title, content, status and permalink are required.' };
    }
    
    const existingPost = posts.find(p => p.id === permalink);
    if (existingPost) {
        return { error: 'A post with this permalink already exists.' };
    }


    const newPost: Post = {
        id: permalink,
        title,
        content,
        status,
        createdAt: new Date().toISOString().split('T')[0],
        author: {
            name: user.name,
            avatarUrl: user.avatarUrl,
        },
        authorId: user.id,
        tags: (formData.get('tags-hidden') as string)?.split(',').filter(Boolean) || [],
        featuredImage: featuredImageUrl ? { url: featuredImageUrl, alt: title } : undefined
    };

    const updatedPosts = [newPost, ...posts];

    try {
        const postsFilePath = path.join(process.cwd(), 'src', 'lib', 'posts.json');
        await fs.writeFile(postsFilePath, JSON.stringify(updatedPosts, null, 2));
        setPosts(updatedPosts);
    } catch (error) {
        console.error("Failed to save post:", error);
        return { error: 'Failed to save post. Please try again.' };
    }

    revalidatePath('/admin/posts');
    revalidatePath('/');
    redirect('/admin/posts');
}


export async function updatePost(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session || !session.userId) {
        return { error: "You must be logged in to update a post." };
    }

    const postId = formData.get('postId') as string;
    const permalink = formData.get('permalink') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const status = formData.get('status') as 'Draft' | 'Published' | 'Scheduled';
    const tags = (formData.get('tags-hidden') as string)?.split(',').filter(Boolean) || [];
    const featuredImageUrl = formData.get('featured-image-url') as string;

    if (!postId || !title || !content || !status || !permalink) {
        return { error: 'Post ID, permalink, title, content, and status are required.' };
    }

    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
        return { error: 'Post not found.' };
    }
    
    // Check if another post already has the new permalink
    if (permalink !== postId && posts.some(p => p.id === permalink)) {
        return { error: 'Another post with this permalink already exists.' };
    }


    const updatedPost: Post = {
        ...posts[postIndex],
        id: permalink, // The permalink is the new ID
        title,
        content,
        status,
        tags,
        featuredImage: featuredImageUrl ? { url: featuredImageUrl, alt: title } : posts[postIndex].featuredImage
    };

    const updatedPosts = [...posts];
    updatedPosts[postIndex] = updatedPost;

    try {
        const postsFilePath = path.join(process.cwd(), 'src', 'lib', 'posts.json');
        await fs.writeFile(postsFilePath, JSON.stringify(updatedPosts, null, 2));
        setPosts(updatedPosts);
    } catch (error) {
        console.error("Failed to update post:", error);
        return { error: 'Failed to update post. Please try again.' };
    }
    
    revalidatePath('/admin/posts');
    revalidatePath(`/admin/posts/${postId}/edit`); // old path
    revalidatePath(`/admin/posts/${permalink}/edit`); // new path
    revalidatePath(`/${postId}`); // old path
    revalidatePath(`/${permalink}`); // new path
    revalidatePath('/');
    redirect('/admin/posts');
}


export async function deletePost(postId: string) {
    const session = await getSession();
    if (!session || !session.userId) {
        // Or handle unauthorized access appropriately
        throw new Error("Unauthorized");
    }

    const updatedPosts = posts.filter(p => p.id !== postId);

    if (updatedPosts.length === posts.length) {
        // Post not found
        return { error: 'Post not found.' };
    }

    try {
        const postsFilePath = path.join(process.cwd(), 'src', 'lib', 'posts.json');
        await fs.writeFile(postsFilePath, JSON.stringify(updatedPosts, null, 2));
        setPosts(updatedPosts);
        revalidatePath('/admin/posts');
        revalidatePath('/admin/dashboard');
        revalidatePath('/');
        return { success: 'Post deleted successfully.' };
    } catch (error) {
        console.error("Failed to delete post:", error);
        return { error: 'Failed to delete post. Please try again.' };
    }
}

export async function getImages(): Promise<ImagePlaceholder[]> {
    try {
        const imagesFilePath = path.join(process.cwd(), 'src', 'lib', 'placeholder-images.json');
        const currentImagesData = await fs.readFile(imagesFilePath, 'utf-8');
        const currentImagesJson = JSON.parse(currentImagesData);
        return currentImagesJson.placeholderImages as ImagePlaceholder[];
    } catch (error) {
        console.error("Failed to get images:", error);
        return [];
    }
}

export async function uploadMedia(fileDataUrl: string, fileName: string) {
    const session = await getSession();
    if (!session) {
      return { error: "Unauthorized" };
    }
  
    try {
      const imagesFilePath = path.join(process.cwd(), 'src', 'lib', 'placeholder-images.json');
      const currentImagesData = await fs.readFile(imagesFilePath, 'utf-8');
      const currentImagesJson = JSON.parse(currentImagesData);
  
      const newImage: ImagePlaceholder = {
        id: `media-${Date.now()}`,
        description: fileName,
        // In a real app, you would upload to a CDN and store the URL.
        // For this demo, we'll store the data URL directly.
        // This is NOT recommended for production due to performance implications.
        imageUrl: fileDataUrl, 
        imageHint: "custom upload",
      };
      
      const updatedImages = [newImage, ...currentImagesJson.placeholderImages];
      currentImagesJson.placeholderImages = updatedImages;
  
      await fs.writeFile(imagesFilePath, JSON.stringify(currentImagesJson, null, 2));
      
      // We don't need to update the in-memory `PlaceHolderImages` because 
      // the page will be revalidated and will re-read the JSON file.
      
      revalidatePath('/admin/media');
      return { success: true, newImage };
  
    } catch (error) {
      console.error("Failed to upload media:", error);
      return { error: 'Failed to upload media. Please try again.' };
    }
  }


  export async function deleteMedia(imageId: string) {
    const session = await getSession();
    if (!session) {
      return { error: "Unauthorized" };
    }
  
    try {
      const imagesFilePath = path.join(process.cwd(), 'src', 'lib', 'placeholder-images.json');
      const currentImagesData = await fs.readFile(imagesFilePath, 'utf-8');
      const currentImagesJson = JSON.parse(currentImagesData);
  
      const initialLength = currentImagesJson.placeholderImages.length;
      const updatedImages = currentImagesJson.placeholderImages.filter((img: ImagePlaceholder) => img.id !== imageId);
      
      if (updatedImages.length === initialLength) {
        return { error: 'Image not found.' };
      }
      
      currentImagesJson.placeholderImages = updatedImages;
  
      await fs.writeFile(imagesFilePath, JSON.stringify(currentImagesJson, null, 2));
      
      revalidatePath('/admin/media');
      return { success: true };
  
    } catch (error) {
      console.error("Failed to delete media:", error);
      return { error: 'Failed to delete media. Please try again.' };
    }
  }

  export async function updateSettings(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session) {
      return { error: "Unauthorized" };
    }

    const currentSettings = await getSettings();

    const siteName = formData.get('site-name') as string;
    const tagline = formData.get('tagline') as string;
    const logo = formData.get('logo') as string;

    if (!siteName) {
        return { error: 'Site name is required.' };
    }

    const newSettings: SiteSettings = {
        ...currentSettings,
        siteName,
        tagline,
        logo,
    };

    try {
        const settingsFilePath = path.join(process.cwd(), 'src', 'lib', 'settings.json');
        await fs.writeFile(settingsFilePath, JSON.stringify(newSettings, null, 2));
        
        clearSettingsCache(); // Clear the in-memory cache

        revalidatePath('/admin/settings');
        revalidatePath('/');
        revalidatePath('/[postId]', 'page');
        revalidatePath('/admin', 'layout');


        return { success: 'Settings updated successfully.' };

    } catch (error) {
        console.error("Failed to update settings:", error);
        return { error: 'Failed to update settings. Please try again.' };
    }
}

export async function updateUser(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session || !session.userId) {
        return { error: "You must be logged in to update your profile." };
    }

    const name = formData.get('name') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!name) {
        return { error: 'Name is required.' };
    }

    if (password && password !== confirmPassword) {
        return { error: 'Passwords do not match.' };
    }
    
    const userIndex = users.findIndex(u => u.id === session.userId);

    if (userIndex === -1) {
        return { error: 'User not found.' };
    }
    
    const originalUser = users[userIndex];

    const updatedUser: User = { ...originalUser, name };

    if (password) {
        updatedUser.password = password; // Again, hash this in a real app
    }
    
    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;

    // Now, update the author name in all posts by this user
    const updatedPosts = posts.map(post => {
        if (post.authorId === session.userId) {
            return {
                ...post,
                author: {
                    ...post.author,
                    name: name
                }
            };
        }
        return post;
    });

    try {
        const usersFilePath = path.join(process.cwd(), 'src', 'lib', 'users.json');
        await fs.writeFile(usersFilePath, JSON.stringify(updatedUsers, null, 2));
        setUsers(updatedUsers);

        const postsFilePath = path.join(process.cwd(), 'src', 'lib', 'posts.json');
        await fs.writeFile(postsFilePath, JSON.stringify(updatedPosts, null, 2));
        setPosts(updatedPosts);

    } catch (error) {
        console.error("Failed to data:", error);
        return { error: 'Failed to update profile. Please try again.' };
    }

    revalidatePath('/admin/profile');
    revalidatePath('/admin/layout'); // To refresh header
    revalidatePath('/'); // To refresh blog posts with new author name

    return { success: 'Profile updated successfully.' };
}

export async function updateUserAvatar(userId: string, avatarDataUrl: string) {
    const session = await getSession();
    if (!session || session.userId !== userId) {
        return { error: "Unauthorized" };
    }

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return { error: 'User not found.' };
    }

    // Update user's avatar
    const updatedUsers = [...users];
    updatedUsers[userIndex].avatarUrl = avatarDataUrl;

    // Update author avatar in all posts by this user
    const updatedPosts = posts.map(post => {
        if (post.authorId === userId) {
            return {
                ...post,
                author: {
                    ...post.author,
                    avatarUrl: avatarDataUrl
                }
            };
        }
        return post;
    });

    try {
        const usersFilePath = path.join(process.cwd(), 'src', 'lib', 'users.json');
        await fs.writeFile(usersFilePath, JSON.stringify(updatedUsers, null, 2));
        setUsers(updatedUsers);

        const postsFilePath = path.join(process.cwd(), 'src', 'lib', 'posts.json');
        await fs.writeFile(postsFilePath, JSON.stringify(updatedPosts, null, 2));
        setPosts(updatedPosts);

    } catch (error) {
        console.error("Failed to update avatar:", error);
        return { error: 'Failed to update profile picture. Please try again.' };
    }

    revalidatePath('/admin/profile');
    revalidatePath('/admin/layout');
    revalidatePath('/');
    
    return { success: 'Profile picture updated successfully.', newAvatarUrl: avatarDataUrl };
}


// --- User Management Actions ---

export async function getUsersClient(): Promise<User[]> {
    return users;
}

export async function getUserById(userId: string): Promise<User | undefined> {
    return users.find(u => u.id === userId);
}


export async function createUser(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session) {
        return { error: "Unauthorized" };
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as 'Admin' | 'Editor' | 'Author';

    if (!name || !email || !password || !role) {
        return { error: 'All fields are required.' };
    }
    
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return { error: 'A user with this email already exists.' };
    }

    const newUser: User = {
        id: `${Date.now()}`,
        name,
        email,
        password,
        role,
        avatarUrl: `https://picsum.photos/seed/${Date.now()}/32/32`,
        createdAt: new Date().toISOString().split('T')[0],
    };

    const updatedUsers = [...users, newUser];

    try {
        const usersFilePath = path.join(process.cwd(), 'src', 'lib', 'users.json');
        await fs.writeFile(usersFilePath, JSON.stringify(updatedUsers, null, 2));
        setUsers(updatedUsers);
    } catch (error) {
        console.error("Failed to create user:", error);
        return { error: 'Failed to create user. Please try again.' };
    }
    
    revalidatePath('/admin/users');
    redirect('/admin/users');
}

export async function adminUpdateUser(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session) {
        return { error: "Unauthorized" };
    }

    const userId = formData.get('userId') as string;
    const name = formData.get('name') as string;
    const role = formData.get('role') as 'Admin' | 'Editor' | 'Author';

    if (!userId || !name || !role) {
        return { error: 'User ID, name and role are required.' };
    }

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return { error: 'User not found.' };
    }
    
    const updatedUsers = [...users];
    updatedUsers[userIndex] = { ...updatedUsers[userIndex], name, role };
    
    // Also update author name in posts
    const updatedPosts = posts.map(post => {
        if (post.authorId === userId) {
            return { ...post, author: { ...post.author, name: name } };
        }
        return post;
    });


    try {
        const usersFilePath = path.join(process.cwd(), 'src', 'lib', 'users.json');
        await fs.writeFile(usersFilePath, JSON.stringify(updatedUsers, null, 2));
        setUsers(updatedUsers);

        const postsFilePath = path.join(process.cwd(), 'src', 'lib', 'posts.json');
        await fs.writeFile(postsFilePath, JSON.stringify(updatedPosts, null, 2));
        setPosts(updatedPosts);
    } catch (error) {
        console.error("Failed to update user:", error);
        return { error: 'Failed to update user. Please try again.' };
    }
    
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}/edit`);
    redirect('/admin/users');
}


export async function deleteUser(userId: string) {
    const session = await getSession();
    if (!session) {
      return { error: "Unauthorized" };
    }

    // Prevent deleting the last user
    if (users.length <= 1) {
        return { error: "Cannot delete the last user." };
    }
    // Prevent deleting oneself
    if (session.userId === userId) {
        return { error: "You cannot delete your own account." };
    }

    const updatedUsers = users.filter(u => u.id !== userId);
    // Also delete all posts by this user
    const updatedPosts = posts.filter(p => p.authorId !== userId);

    try {
        const usersFilePath = path.join(process.cwd(), 'src', 'lib', 'users.json');
        await fs.writeFile(usersFilePath, JSON.stringify(updatedUsers, null, 2));
        setUsers(updatedUsers);

        const postsFilePath = path.join(process.cwd(), 'src', 'lib', 'posts.json');
        await fs.writeFile(postsFilePath, JSON.stringify(updatedPosts, null, 2));
        setPosts(updatedPosts);
    } catch (error) {
        console.error("Failed to delete user:", error);
        return { error: 'Failed to delete user. Please try again.' };
    }

    revalidatePath('/admin/users');
    return { success: "User deleted successfully." };
}

    

    