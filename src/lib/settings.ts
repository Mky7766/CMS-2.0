
import fs from 'fs/promises';
import path from 'path';

export type SiteSettings = {
  siteName: string;
  tagline: string;
};

// In-memory cache for settings
let cachedSettings: SiteSettings | null = null;

export async function getSettings(): Promise<SiteSettings> {
  if (cachedSettings) {
    return cachedSettings;
  }

  try {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'settings.json');
    const data = await fs.readFile(filePath, 'utf-8');
    cachedSettings = JSON.parse(data);
    return cachedSettings!;
  } catch (error) {
    // If the file doesn't exist or is invalid, return default settings
    console.warn("settings.json not found or invalid, using default settings.");
    const defaultSettings = {
      siteName: "Nebula CMS",
      tagline: "A modern, git-based CMS",
    };
    cachedSettings = defaultSettings;
    return defaultSettings;
  }
}
