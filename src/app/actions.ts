"use server"

import { customizeTheme } from "@/ai/flows/theme-customization";
import fs from "fs/promises";
import path from "path";
import { redirect } from 'next/navigation';
import { User, users, setUsers, posts, Post } from "@/lib/data";
import { createSession, deleteSession, getSession } from "@/lib/session";

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

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const status = formData.get('status') as 'Draft' | 'Published' | 'Scheduled';

    if (!title || !content || !status) {
        return { error: 'Title, content, and status are required.' };
    }

    const newPost: Post = {
        id: (posts.length + 1).toString(),
        title,
        status,
        createdAt: new Date().toISOString().split('T')[0],
        author: {
            name: user.name,
            avatarUrl: user.avatarUrl,
        },
    };

    console.log("New Post Data:", newPost);
    // Here you would typically save the new post to your data store (e.g., a file or database)
    // For now, we just log it.

    redirect('/admin/posts');
}