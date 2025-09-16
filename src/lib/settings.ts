import fs from 'fs/promises';
import path from 'path';
import { cache } from 'react';

export type SiteSettings = {
  siteName: string;
  tagline: string;
  logo: string;
  headerMenuId?: string;
  footerMenuId?: string;
  footerText?: string;
};

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
    return settings;
  } catch (error) {
    // If the file doesn't exist or is invalid, return default settings
    console.warn("settings.json not found or invalid, using default settings.");
    const defaultSettings: SiteSettings = {
      siteName: "Nebula CMS",
      tagline: "A modern, git-based CMS",
      logo: "https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600",
      footerText: "Built with ❤️ by the open-source community."
    };
    return defaultSettings;
  }
});

export function clearSettingsCache(): void {
    // Since we are using React's `cache` function, we can't simply nullify
    // a variable. Instead, Next.js's revalidation is the primary mechanism.
    // This function can be kept for potential future direct cache invalidation needs.
}
