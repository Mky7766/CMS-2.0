
"use server"

import fs from "fs/promises";
import path from "path";
import { redirect } from 'next/navigation';
import { User, Post, Menu, Template, Page, Category, PageView } from "@/lib/data";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { revalidatePath, revalidateTag } from "next/cache";
import { ImagePlaceholder } from "@/lib/placeholder-images";
import { SiteSettings } from "@/lib/data";
import { cache } from 'react'
import { getDbPool } from "@/lib/db";
import { Pool } from 'pg';


// In-memory cache for settings
let cachedSettings: SiteSettings | null = null;


async function getPool(): Promise<Pool | null> {
    if (!process.env.POSTGRES_URL) {
        return null;
    }
    try {
        return getDbPool();
    } catch (error) {
        console.error("Database connection failed:", error);
        return null;
    }
}


async function initializeDb() {
    const pool = await getPool();
    if (!pool) return;

    try {
        await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                avatar_url TEXT,
                role VARCHAR(50) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                bio TEXT,
                website VARCHAR(255),
                twitter VARCHAR(255),
                linkedin VARCHAR(255),
                github VARCHAR(255),
                facebook VARCHAR(255),
                instagram VARCHAR(255),
                youtube VARCHAR(255),
                whatsapp VARCHAR(255)
            );
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id VARCHAR(255) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                status VARCHAR(50) NOT NULL,
                created_at DATE NOT NULL,
                author_id UUID REFERENCES users(id) ON DELETE SET NULL,
                author_name VARCHAR(255),
                author_avatar_url TEXT,
                category_id VARCHAR(255),
                tags TEXT[],
                format VARCHAR(50),
                hide_title BOOLEAN,
                featured_image_url TEXT,
                featured_image_alt TEXT
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS pages (
                id VARCHAR(255) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                status VARCHAR(50) NOT NULL,
                created_at DATE NOT NULL,
                author_id UUID REFERENCES users(id) ON DELETE SET NULL,
                hide_title BOOLEAN
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS menus (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                items JSONB
            );
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                description TEXT
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
                settings_data JSONB
            );
        `);

        // Seed initial data if tables are empty
        const catCheck = await pool.query('SELECT COUNT(*) FROM categories');
        if (catCheck.rows[0].count === '0') {
             await pool.query(`
                INSERT INTO categories (id, name, slug, description) 
                VALUES ('uncategorized', 'Uncategorized', 'uncategorized', 'Posts that don''t fit into any other category.')
            `);
        }
        
        const settingsCheck = await pool.query('SELECT COUNT(*) FROM settings');
        if (settingsCheck.rows[0].count === '0') {
            const defaultSettings = {
                siteName: "Vinee CMS",
                tagline: "A modern, git-based CMS",
                footerText: "Built with ❤️ by the open-source community.",
                blogTemplate: "grid",
                showAuthorBio: true,
            };
            await pool.query(`
                INSERT INTO settings (id, settings_data) 
                VALUES ('default', $1)
            `, [JSON.stringify(defaultSettings)]);
        }

    } catch (dbError) {
        console.error("DB initializeDb Error:", dbError);
        throw new Error("Database initialization failed.");
    }
}

export async function saveDatabaseUrl(prevState: any, formData: FormData) {
    const url = formData.get('db-url') as string;
    if (!url) {
        return { error: "Database URL is required." };
    }
    
    try {
        const envPath = path.join(process.cwd(), '.env');
        await fs.writeFile(envPath, `POSTGRES_URL=${url}\n`);
    } catch (error) {
        console.error("Failed to save database URL:", error);
        return { error: "Could not save the database URL. Please try again." };
    }

    redirect('/login');
}


export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (cachedSettings) {
    return cachedSettings;
  }
  
  const defaultSettings: SiteSettings = {
      siteName: "Vinee CMS",
      tagline: "A modern, git-based CMS",
      footerText: "Built with ❤️ by the open-source community.",
      blogTemplate: "grid"
  };

  const pool = await getPool();
  if (!pool) return defaultSettings;

  try {
    const result = await pool.query('SELECT settings_data FROM settings WHERE id = $1', ['default']);
    if (result.rows.length > 0) {
        const settings = result.rows[0].settings_data as SiteSettings;
        cachedSettings = settings;
        return settings;
    } else {
        // If no settings in DB, seed them.
        await pool.query(`
            INSERT INTO settings (id, settings_data) 
            VALUES ('default', $1)
        `, [JSON.stringify(defaultSettings)]);
        cachedSettings = defaultSettings;
        return defaultSettings;
    }
  } catch (error) {
    console.warn("Database error fetching settings, using default settings.", error);
    return defaultSettings;
  }
});

export async function clearSettingsCache(): Promise<void> {
    cachedSettings = null;
    revalidateTag('settings');
}

export async function getUsersCount(): Promise<number> {
    const pool = await getPool();
    if (!pool) return 0;

    try {
        // Check if users table exists first
        const tableCheck = await pool.query("SELECT to_regclass('public.users')");
        if (tableCheck.rows[0].to_regclass === null) {
            return 0; // Table doesn't exist, so 0 users.
        }
        
        const result = await pool.query('SELECT COUNT(*) FROM users');
        return parseInt(result.rows[0].count, 10);
    } catch (dbError) {
        console.error("DB getUsersCount Error:", dbError);
        // If there's an error (e.g., db not ready), assume no users to allow signup.
        return 0;
    }
}


export async function signup(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email and password are required.' };
    }
    
    const pool = await getPool();
    if (!pool) {
        return { error: 'Database not configured. Please go to /setup.' };
    }

    try {
        await initializeDb();
        
        const userCountResult = await pool.query('SELECT COUNT(*) FROM users');
        const isFirstUser = parseInt(userCountResult.rows[0].count, 10) === 0;

        const existingUserResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUserResult.rows.length > 0) {
            return { error: 'User with this email already exists.' };
        }
        
        const role = isFirstUser ? 'Admin' : 'Author';
        const name = email.split('@')[0];
        const avatarUrl = `https://picsum.photos/seed/${Math.random()}/32/32`;

        const insertResult = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [name, email, password, role, avatarUrl]
        );
        const newUserId = insertResult.rows[0].id;

        await createSession(newUserId);

    } catch (dbError: any) {
        console.error("DB Signup Error:", dbError);
        return { error: 'Database error during signup. Please try again. ' + dbError.message };
    }
    
    redirect('/admin/dashboard');
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email and password are required.' };
    }
    
    const pool = await getPool();
    if (!pool) {
        return { error: 'Database not configured. Please go to /setup.' };
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        
        if (!user || user.password_hash !== password) {
             return { error: 'Invalid email or password.' };
        }
        
        await createSession(user.id);
    } catch (dbError) {
        console.error("DB Login Error:", dbError);
        return { error: 'Database error during login. Please try again.' };
    }

    redirect('/admin/dashboard');
}


export async function logout() {
    await deleteSession();
    redirect('/login');
}

export async function savePost(prevState: any, formData: FormData) {
    const pool = await getPool();
    if (!pool) return { error: "Database not connected." };

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const permalink = formData.get('permalink') as string;
    const status = formData.get('status') as 'Published' | 'Draft' | 'Scheduled';
    const featuredImageUrl = formData.get('featured-image-url') as string;
    const tags = (formData.get('tags-hidden') as string).split(',').filter(t => t.trim() !== '');
    const categoryId = formData.get('category-id') as string;
    const format = formData.get('format') as string;
    const hideTitle = formData.get('hide-title') === 'on';

    const session = await getSession();
    if (!session?.userId) {
        return { error: "You must be logged in to create a post." };
    }

    try {
        const authorResult = await pool.query('SELECT * FROM users WHERE id = $1', [session.userId]);
        const author = authorResult.rows[0];
        if (!author) {
            return { error: "Author not found." };
        }

        const permalinkCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [permalink]);
        if (permalinkCheck.rows.length > 0) {
            return { error: `A post with the permalink "${permalink}" already exists.` };
        }

        await pool.query(
            `INSERT INTO posts (id, title, content, status, created_at, author_id, author_name, author_avatar_url, category_id, tags, format, hide_title, featured_image_url, featured_image_alt)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [
                permalink,
                title,
                content,
                status,
                new Date().toISOString().split('T')[0],
                author.id,
                author.name,
                author.avatar_url,
                categoryId,
                tags,
                format,
                hideTitle,
                featuredImageUrl || null,
                featuredImageUrl ? title : null
            ]
        );

    } catch (error) {
        console.error("Failed to save post:", error);
        return { error: "Could not save the post. Please try again." };
    }
    
    const settings = await getSettings();
    if (settings.postsPageId) {
        revalidatePath(`/${settings.postsPageId}`);
    }

    revalidatePath('/');
    revalidatePath(`/${permalink}`);
    redirect('/admin/posts');
}



export async function updatePost(prevState: any, formData: FormData) {
    const pool = await getPool();
    if (!pool) return { error: "Database not connected." };

    const postId = formData.get('postId') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const permalink = formData.get('permalink') as string;
    const status = formData.get('status') as 'Published' | 'Draft' | 'Scheduled';
    const featuredImageUrl = formData.get('featured-image-url') as string;
    const tags = (formData.get('tags-hidden') as string).split(',').filter(t => t.trim() !== '');
    const categoryId = formData.get('category-id') as string;
    const format = formData.get('format') as string;
    const hideTitle = formData.get('hide-title') === 'on';

    const session = await getSession();
    if (!session?.userId) {
        return { error: "You must be logged in to update a post." };
    }

    try {
        const postCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
        if (postCheck.rows.length === 0) {
            return { error: "Post not found." };
        }

        if (permalink !== postId) {
            const permalinkCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [permalink]);
            if (permalinkCheck.rows.length > 0) {
                return { error: `A post with the permalink "${permalink}" already exists.` };
            }
        }

        await pool.query(
            `UPDATE posts SET 
                id = $1, title = $2, content = $3, status = $4, tags = $5, category_id = $6, 
                format = $7, hide_title = $8, featured_image_url = $9, featured_image_alt = $10
             WHERE id = $11`,
            [
                permalink, title, content, status, tags, categoryId, format, hideTitle,
                featuredImageUrl || null, featuredImageUrl ? title : null, postId
            ]
        );

    } catch (error) {
        console.error("Failed to update post:", error);
        return { error: "Could not update the post. Please try again." };
    }
    
    const settings = await getSettings();
    if (settings.postsPageId) {
        revalidatePath(`/${settings.postsPageId}`);
    }

    revalidatePath('/');
    revalidatePath(`/${postId}`);
    revalidatePath(`/${permalink}`);
    redirect('/admin/posts');
}


export async function deletePost(postId: string) {
    const session = await getSession();
    if (!session?.userId) {
        return { error: "You are not authorized to delete this post." };
    }
    
    const pool = await getPool();
    if (!pool) return { error: "Database not connected." };

    try {
        await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
    } catch (error) {
        console.error("Failed to delete post:", error);
        return { error: "Could not delete the post. Please try again." };
    }
    
    const settings = await getSettings();
    if (settings.postsPageId) {
        revalidatePath(`/${settings.postsPageId}`);
    }

    revalidatePath('/');
    revalidatePath(`/admin/posts`);
    revalidatePath(`/${postId}`);
    return { success: "Post deleted successfully." };
}

export async function createPage(prevState: any, formData: FormData) {
    const pool = await getPool();
    if (!pool) return { error: "Database not connected." };

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const permalink = formData.get('permalink') as string;
    const status = formData.get('status') as 'Published' | 'Draft';
    const hideTitle = formData.get('hide-title') === 'on';

    const session = await getSession();
    if (!session?.userId) {
        return { error: "You must be logged in to create a page." };
    }
    
    try {
        const permalinkCheck = await pool.query('SELECT id FROM pages WHERE id = $1', [permalink]);
        if (permalinkCheck.rows.length > 0) {
            return { error: `A page with the permalink "${permalink}" already exists.` };
        }

        await pool.query(
            `INSERT INTO pages (id, title, content, status, created_at, author_id, hide_title)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                permalink, title, content, status, new Date().toISOString().split('T')[0],
                session.userId, hideTitle
            ]
        );
    } catch (error) {
        console.error("Failed to create page:", error);
        return { error: "Could not save the page. Please try again." };
    }

    revalidatePath(`/${permalink}`);
    revalidatePath('/admin/pages');
    redirect('/admin/pages');
}

export async function updatePage(prevState: any, formData: FormData) {
    const pool = await getPool();
    if (!pool) return { error: "Database not connected." };

    const pageId = formData.get('pageId') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const permalink = formData.get('permalink') as string;
    const status = formData.get('status') as 'Published' | 'Draft';
    const hideTitle = formData.get('hide-title') === 'on';

    const session = await getSession();
    if (!session?.userId) {
        return { error: "You must be logged in to update a page." };
    }
    
    try {
        const pageCheck = await pool.query('SELECT id FROM pages WHERE id = $1', [pageId]);
        if (pageCheck.rows.length === 0) {
            return { error: "Page not found." };
        }

        if (permalink !== pageId) {
            const permalinkCheck = await pool.query('SELECT id FROM pages WHERE id = $1', [permalink]);
            if (permalinkCheck.rows.length > 0) {
                return { error: `A page with the permalink "${permalink}" already exists.` };
            }
        }
        
        await pool.query(
            `UPDATE pages SET 
                id = $1, title = $2, content = $3, status = $4, hide_title = $5
             WHERE id = $6`,
            [permalink, title, content, status, hideTitle, pageId]
        );

    } catch (error) {
        console.error("Failed to update page:", error);
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

    const pool = await getPool();
    if (!pool) return { error: "Database not connected." };

    try {
        await pool.query('DELETE FROM pages WHERE id = $1', [pageId]);
    } catch (error) {
        console.error("Failed to delete page:", error);
        return { error: "Could not delete the page. Please try again." };
    }

    revalidatePath(`/admin/pages`);
    revalidatePath(`/${pageId}`);
    return { success: "Page deleted successfully." };
}

export async function getPosts(): Promise<Post[]> {
    const pool = await getPool();
    if (!pool) return [];
    
    try {
        await pool.query('SELECT id FROM posts LIMIT 1').catch(() => initializeDb());
        const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
        
        return result.rows.map(row => ({
            id: row.id,
            title: row.title,
            content: row.content,
            status: row.status,
            createdAt: new Date(row.created_at).toISOString().split('T')[0],
            authorId: row.author_id,
            author: {
                name: row.author_name,
                avatarUrl: row.author_avatar_url
            },
            categoryId: row.category_id,
            tags: row.tags,
            format: row.format,
            hideTitle: row.hide_title,
            featuredImage: row.featured_image_url ? {
                url: row.featured_image_url,
                alt: row.featured_image_alt,
            } : undefined
        }));
    } catch (error) {
        console.error("DB getPosts Error:", error);
        return [];
    }
}


export async function getPages(): Promise<Page[]> {
    const pool = await getPool();
    if (!pool) return [];

    try {
        await pool.query('SELECT id FROM pages LIMIT 1').catch(() => initializeDb());
        const result = await pool.query('SELECT * FROM pages ORDER BY created_at DESC');

        return result.rows.map(row => ({
            id: row.id,
            title: row.title,
            content: row.content,
            status: row.status,
            createdAt: new Date(row.created_at).toISOString().split('T')[0],
            authorId: row.author_id,
            hideTitle: row.hide_title,
        }));
    } catch (error) {
        console.error("DB getPages Error:", error);
        return [];
    }
}

export async function getPage(pageId: string): Promise<Page | undefined> {
    const pool = await getPool();
    if (!pool) return undefined;

    try {
        const result = await pool.query('SELECT * FROM pages WHERE id = $1', [pageId]);
        if (result.rows.length === 0) return undefined;
        const row = result.rows[0];
         return {
            id: row.id,
            title: row.title,
            content: row.content,
            status: row.status,
            createdAt: new Date(row.created_at).toISOString().split('T')[0],
            authorId: row.author_id,
            hideTitle: row.hide_title,
        };
    } catch (error) {
        console.error("DB getPage Error:", error);
        return undefined;
    }
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

    const pool = await getPool();
    if (!pool) return { error: "Database not connected." };
    
    try {
        const currentSettings = await getSettings();

        const updatedSettings: SiteSettings = {
            ...currentSettings,
            siteName: formData.has('site-name') ? formData.get('site-name') as string : currentSettings.siteName,
            tagline: formData.has('tagline') ? formData.get('tagline') as string : currentSettings.tagline,
            logoUrl: formData.has('logo-url') ? formData.get('logo-url') as string : currentSettings.logoUrl,
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
            homepagePageId: formData.has('homepage-page-id') ? formData.get('homepage-page-id') as string : currentSettings.homepagePageId,
            postsPageId: formData.has('posts-page-id') ? formData.get('posts-page-id') as string : currentSettings.postsPageId,
            showAuthorBio: formData.has('show-author-bio') ? formData.get('show-author-bio') === 'on' : currentSettings.showAuthorBio,
            theme: {
                ...currentSettings.theme,
                primary: formData.has('theme-primary') ? formData.get('theme-primary') as string : currentSettings.theme?.primary,
                accent: formData.has('theme-accent') ? formData.get('theme-accent') as string : currentSettings.theme?.accent,
                background: formData.has('theme-background') ? formData.get('theme-background') as string : currentSettings.theme?.background,
            },
            firebaseConfig: {
                ...currentSettings.firebaseConfig,
                apiKey: formData.has('firebase-apiKey') ? formData.get('firebase-apiKey') as string : currentSettings.firebaseConfig?.apiKey,
                authDomain: formData.has('firebase-authDomain') ? formData.get('firebase-authDomain') as string : currentSettings.firebaseConfig?.authDomain,
                projectId: formData.has('firebase-projectId') ? formData.get('firebase-projectId') as string : currentSettings.firebaseConfig?.projectId,
                storageBucket: formData.has('firebase-storageBucket') ? formData.get('firebase-storageBucket') as string : currentSettings.firebaseConfig?.storageBucket,
                messagingSenderId: formData.has('firebase-messagingSenderId') ? formData.get('firebase-messagingSenderId') as string : currentSettings.firebaseConfig?.messagingSenderId,
                appId: formData.has('firebase-appId') ? formData.get('firebase-appId') as string : currentSettings.firebaseConfig?.appId,
            }
        };

        await pool.query(`
            UPDATE settings SET settings_data = $1 WHERE id = 'default'
        `, [JSON.stringify(updatedSettings)]);
        
        await clearSettingsCache();
        revalidatePath('/', 'layout');
        revalidatePath('/ads.txt');
        revalidatePath('/robots.txt');
        revalidatePath('/sitemap.xml');
        revalidatePath('/admin/appearance/templates');
        revalidatePath('/admin/appearance/customize');
        revalidatePath('/admin/settings');


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
    
    const pool = await getPool();
    if (!pool) return { error: "Database not connected." };

    try {
        const existingUserResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUserResult.rows.length > 0) {
            return { error: 'A user with this email already exists.' };
        }

        const avatarUrl = `https://picsum.photos/seed/user-${Date.now()}/32/32`;

        await pool.query(
            `INSERT INTO users (name, email, password_hash, role, avatar_url, created_at) VALUES ($1, $2, $3, $4, $5, $6)`,
            [name, email, password, role, avatarUrl, new Date()]
        );
        
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
    const bio = formData.get('bio') as string;

    const pool = await getPool();
    if (!pool) return { error: "Database not connected." };
    
    try {
       await pool.query(
           'UPDATE users SET name = $1, role = $2, bio = $3 WHERE id = $4',
           [name, role, bio, userId]
       )
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
    const bio = formData.get('bio') as string;
    
    const twitter = formData.get('twitter') as string;
    const linkedin = formData.get('linkedin') as string;
    const github = formData.get('github') as string;
    const website = formData.get('website') as string;
    const facebook = formData.get('facebook') as string;
    const instagram = formData.get('instagram') as string;
    const youtube = formData.get('youtube') as string;
    const whatsapp = formData.get('whatsapp') as string;

    const pool = await getPool();
    if (!pool) return { error: "Database not connected." };

    try {
        let query = `
            UPDATE users SET 
                name = $1, bio = $2, twitter = $3, linkedin = $4, github = $5, website = $6,
                facebook = $7, instagram = $8, youtube = $9, whatsapp = $10
        `;
        const params: any[] = [name, bio, twitter, linkedin, github, website, facebook, instagram, youtube, whatsapp];

        if (password) {
            if (password !== confirmPassword) {
                return { error: "Passwords do not match." };
            }
            query += `, password_hash = $${params.length + 1}`;
            params.push(password); // Hash in a real app
        }
        
        query += ` WHERE id = $${params.length + 1}`;
        params.push(session.userId);

        await pool.query(query, params);

    } catch (error) {
        return { error: "Failed to update profile." };
    }

    revalidatePath('/admin/profile');
    return { success: "Profile updated successfully." };
}


export async function updateUserAvatar(userId: string, dataUrl: string) {
    const session = await getSession();
    if (!session?.userId || (session.userId !== userId && session.role !== 'Admin')) {
        return { error: "Unauthorized." };
    }

    const pool = await getPool();
    if (!pool) return { error: "Database not connected." };

    try {
       await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [dataUrl, userId]);
    } catch (error) {
        return { error: "Failed to update avatar." };
    }

    revalidatePath('/admin/profile');
    revalidatePath('/admin/users');
    revalidatePath('/admin');
    return { success: "Avatar updated.", newAvatarUrl: dataUrl };
}

export async function deleteUser(userId: string) {
    const session = await getSession();
    if (!session?.userId) { return { error: "Unauthorized." }; }
    
    if (session.userId === userId) {
        return { error: "You cannot delete your own account." };
    }

    const pool = await getPool();
    if (!pool) return { error: "Database not connected." };

    try {
        await pool.query('DELETE FROM posts WHERE author_id = $1', [userId]);
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    } catch (error) {
        return { error: "Failed to delete user and their posts." };
    }

    revalidatePath('/admin/users');
    revalidatePath('/');
    return { success: "User deleted successfully." };
}

export async function getUserById(userId: string): Promise<User | null> {
    const pool = await getPool();
    if (!pool) return null;
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        const dbUser = result.rows[0];
        if (!dbUser) return null;

        return {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            password: dbUser.password_hash,
            avatarUrl: dbUser.avatar_url,
            role: dbUser.role,
            createdAt: dbUser.created_at,
            bio: dbUser.bio,
            twitter: dbUser.twitter,
            linkedin: dbUser.linkedin,
            github: dbUser.github,
            website: dbUser.website,
            facebook: dbUser.facebook,
            instagram: dbUser.instagram,
            youtube: dbUser.youtube,
            whatsapp: dbUser.whatsapp,
        };
    } catch (error) {
        console.error("DB getUserById Error:", error);
        return null;
    }
}

export async function getUsers(): Promise<User[]> {
    const pool = await getPool();
    if (!pool) return [];
    
    try {
        await pool.query('SELECT id FROM users LIMIT 1').catch(() => initializeDb());
        const result = await pool.query('SELECT * FROM users');
        return result.rows.map(dbUser => ({
             id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            password: dbUser.password_hash,
            avatarUrl: dbUser.avatar_url,
            role: dbUser.role,
            createdAt: new Date(dbUser.created_at).toISOString().split('T')[0],
            bio: dbUser.bio,
            twitter: dbUser.twitter,
            linkedin: dbUser.linkedin,
            github: dbUser.github,
            website: dbUser.website,
            facebook: dbUser.facebook,
            instagram: dbUser.instagram,
            youtube: dbUser.youtube,
            whatsapp: dbUser.whatsapp,
        }));
    } catch (error) {
        console.error("DB getUsers Error:", error);
        return [];
    }
}


export async function getUsersClient(): Promise<Omit<User, 'password'>[]> {
     const pool = await getPool();
    if (!pool) return [];
    
    try {
        const result = await pool.query('SELECT id, name, email, avatar_url, role, created_at, bio, twitter, linkedin, github, website, facebook, instagram, youtube, whatsapp FROM users');
        return result.rows.map(dbUser => ({
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            avatarUrl: dbUser.avatar_url,
            role: dbUser.role,
            createdAt: new Date(dbUser.created_at).toISOString().split('T')[0],
            bio: dbUser.bio,
            twitter: dbUser.twitter,
            linkedin: dbUser.linkedin,
            github: dbUser.github,
            website: dbUser.website,
            facebook: dbUser.facebook,
            instagram: dbUser.instagram,
            youtube: dbUser.youtube,
            whatsapp: dbUser.whatsapp,
        }));
    } catch (error) {
        console.error("DB getUsersClient Error:", error);
        return [];
    }
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

    const pool = await getPool();
    if (!pool) return { error: "Database not connected." };
    
    const newMenu: Menu = {
        id: `${Date.now()}`,
        name: menuName,
        items: labels.map((label, index) => ({ label, url: urls[index] })),
    };

    try {
        await pool.query(
            'INSERT INTO menus (id, name, items) VALUES ($1, $2, $3)',
            [newMenu.id, newMenu.name, JSON.stringify(newMenu.items)]
        );

        if (location === 'header' || location === 'footer') {
             const settings = await getSettings();
             const newSettings = { ...settings };
             if (location === 'header') newSettings.headerMenuId = newMenu.id;
             if (location === 'footer') newSettings.footerMenuId = newMenu.id;
             await pool.query('UPDATE settings SET settings_data = $1 WHERE id = $2', [JSON.stringify(newSettings), 'default']);
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

    const pool = await getPool();
    if (!pool) return { error: "Database not connected." };

    try {
        const updatedItems = labels.map((label, index) => ({ label, url: urls[index] }));
        await pool.query(
            'UPDATE menus SET name = $1, items = $2 WHERE id = $3',
            [menuName, JSON.stringify(updatedItems), menuId]
        );

        const settings = await getSettings();
        const newSettings = { ...settings };

        if (settings.headerMenuId === menuId) delete newSettings.headerMenuId;
        if (settings.footerMenuId === menuId) delete newSettings.footerMenuId;
        
        if (location === 'header') newSettings.headerMenuId = menuId;
        if (location === 'footer') newSettings.footerMenuId = menuId;
        
        await pool.query('UPDATE settings SET settings_data = $1 WHERE id = $2', [JSON.stringify(newSettings), 'default']);
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

    const pool = await getPool();
    if (!pool) return { error: "Database not connected." };

    try {
        await pool.query('DELETE FROM menus WHERE id = $1', [menuId]);
        
        const settings = await getSettings();
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
            await pool.query('UPDATE settings SET settings_data = $1 WHERE id = $2', [JSON.stringify(settings), 'default']);
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
    const pool = await getPool();
    if (!pool) return [];

    try {
        await pool.query('SELECT id FROM menus LIMIT 1').catch(() => initializeDb());
        const result = await pool.query('SELECT * FROM menus');
        return result.rows.map(row => ({
            id: row.id,
            name: row.name,
            items: row.items,
        }));
    } catch (error) {
        console.error("DB getMenus Error:", error);
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
    const pool = await getPool();
    if (!pool) return [{ id: 'uncategorized', name: 'Uncategorized', slug: 'uncategorized' }];
    try {
        await pool.query('SELECT id FROM categories LIMIT 1').catch(() => initializeDb());
        const result = await pool.query('SELECT * FROM categories');
        return result.rows;
    } catch (error) {
        console.error("DB getCategories Error:", error);
        return [{ id: 'uncategorized', name: 'Uncategorized', slug: 'uncategorized' }];
    }
}

export async function createCategory(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session?.userId) return { error: "Unauthorized." };

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;

    if (!name || !slug) return { error: "Name and slug are required." };

    const pool = await getPool();
    if (!pool) return { error: "Database not connected." };

    try {
        const slugCheck = await pool.query('SELECT id FROM categories WHERE slug = $1', [slug]);
        if (slugCheck.rows.length > 0) {
            return { error: `A category with the slug "${slug}" already exists.` };
        }
    
        const newCategory: Omit<Category, 'id'> = { name, slug };
        await pool.query(
            'INSERT INTO categories (id, name, slug) VALUES ($1, $2, $3)',
            [`cat-${Date.now()}`, newCategory.name, newCategory.slug]
        );
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

    const pool = await getPool();
    if (!pool) return { error: "Database not connected." };
    
    try {
        const slugCheck = await pool.query('SELECT id FROM categories WHERE slug = $1 AND id != $2', [slug, categoryId]);
        if (slugCheck.rows.length > 0) {
            return { error: `A category with the slug "${slug}" already exists.` };
        }

        await pool.query(
            'UPDATE categories SET name = $1, slug = $2 WHERE id = $3',
            [name, slug, categoryId]
        );
    } catch (error) {
        return { error: "Failed to update category." };
    }

    revalidatePath('/admin/categories');
    return { success: "Category updated successfully." };
}

export async function deleteCategory(categoryId: string) {
    const session = await getSession();
    if (!session?.userId) return { error: "Unauthorized." };
    
    if (categoryId === 'uncategorized') {
        return { error: "The default 'Uncategorized' category cannot be deleted." };
    }

    const pool = await getPool();
    if (!pool) return { error: "Database not connected." };
    
    try {
        // Here you might want to re-categorize posts before deleting
        await pool.query('UPDATE posts SET category_id = $1 WHERE category_id = $2', ['uncategorized', categoryId]);
        await pool.query('DELETE FROM categories WHERE id = $1', [categoryId]);
    } catch (error) {
        return { error: "Failed to delete category." };
    }

    revalidatePath('/admin/categories');
    revalidatePath('/');
    return { success: "Category deleted successfully." };
}


// Analytics Actions
export async function getAnalyticsData() {
    const analyticsPath = path.join(process.cwd(), 'src', 'lib', 'analytics.json');
    try {
        const file = await fs.readFile(analyticsPath, 'utf-8');
        return JSON.parse(file) as { pageViews: PageView[] };
    } catch (error) {
        return { pageViews: [] };
    }
}

function getTrafficSource(referrer: string | undefined, host: string): PageView['source'] {
    if (!referrer) {
        return 'Direct';
    }
    
    try {
        const referrerUrl = new URL(referrer);
        if (referrerUrl.hostname === host) {
            return 'Direct'; // Internal navigation
        }
        if (referrerUrl.hostname.includes('google.')) {
            return 'Google';
        }
        if (['facebook.com', 't.co', 'twitter.com', 'linkedin.com', 'instagram.com'].some(social => referrerUrl.hostname.includes(social))) {
            return 'Social';
        }
        return 'Other';
    } catch (e) {
        return 'Other';
    }
}

export async function logPageView(pathname: string, referrer: string | undefined, host: string, country: string | undefined) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
        return;
    }

    // This is a fire-and-forget action on a read-only filesystem, so we will skip writing.
    if (process.env.NODE_ENV === 'production') return;

    const analyticsPath = path.join(process.cwd(), 'src', 'lib', 'analytics.json');
    try {
        const analyticsData = await getAnalyticsData();
        
        const newView: PageView = {
            path: pathname,
            timestamp: new Date().toISOString(),
            referrer: referrer || 'direct',
            source: getTrafficSource(referrer, host),
            country: country || 'Unknown'
        };

        analyticsData.pageViews.push(newView);

        if (analyticsData.pageViews.length > 1000) {
            analyticsData.pageViews = analyticsData.pageViews.slice(-1000);
        }

        await fs.writeFile(analyticsPath, JSON.stringify(analyticsData, null, 2));
    } catch (error) {
        console.error("Failed to log page view:", error);
    }
}

    