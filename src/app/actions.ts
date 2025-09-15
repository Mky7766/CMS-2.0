"use server"

import { customizeTheme } from "@/ai/flows/theme-customization";
import fs from "fs/promises";
import path from "path";

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
