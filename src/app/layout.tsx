
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { getSettings } from './actions';
import HtmlRenderer from '@/components/html-renderer';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: {
      default: settings.siteName || 'Vinee CMS',
      template: `%s | ${settings.siteName || 'Vinee CMS'}`,
    },
    description: settings.tagline || 'A full-featured open-source CMS that runs on static site hosting.',
    icons: {
      icon: settings.faviconUrl || '/favicon.ico',
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const theme = settings.theme || {};
  
  const customStyles = {
    '--background': theme.background,
    '--primary': theme.primary,
    '--accent': theme.accent,
  } as React.CSSProperties;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
        {settings.customHeadCode && <HtmlRenderer htmlContent={settings.customHeadCode} />}
      </head>
      <body 
        className={cn("font-body antialiased min-h-screen bg-background")}
        style={customStyles}
      >
        {children}
        <Toaster />
        {settings.customBodyCode && <HtmlRenderer htmlContent={settings.customBodyCode} />}
      </body>
    </html>
  );
}
