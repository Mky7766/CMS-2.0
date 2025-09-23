
"use client"

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { getSettings } from "@/app/actions";

let app: FirebaseApp | null = null;

export async function getFirebaseApp() {
    if (app) {
        return app;
    }

    if (getApps().length > 0) {
        app = getApp();
        return app;
    }

    const settings = await getSettings();
    const firebaseConfig = settings.firebaseConfig;

    if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId) {
        try {
            app = initializeApp(firebaseConfig);
            return app;
        } catch (error) {
            console.error("Firebase initialization error:", error);
            return null;
        }
    }
    
    return null;
}

export async function signInWithGoogle(): Promise<User | null> {
    const app = await getFirebaseApp();
    if (!app) {
        throw new Error("Firebase is not configured. Please configure it in the admin settings.");
    }
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Error during Google sign-in:", error);
        return null;
    }
}
