
import Link from "next/link";
import Image from "next/image";
import { posts, Menu } from "@/lib/data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { getSettings } from "@/lib/settings";
import fs from 'fs/promises';
import path from 'path';
import HtmlRenderer from "@/components/html-renderer";
import GridTemplate from "@/components/blog-templates/grid-template";
import GridSidebarTemplate from "@/components/blog-templates/grid-sidebar-template";
import ListTemplate from "@/components/blog-templates/list-template";


async function getMenus(): Promise<Menu[]> {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'menus.json');
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data) as Menu[];
    } catch (error) {
        return [];
    }
}

export default async function Home() {
  const settings = await getSettings();
  const publishedPosts = posts.filter(p => p.status.toLowerCase() === 'published').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const menus = await getMenus();
  const headerMenu = menus.find(m => m.id === settings.headerMenuId);
  const footerMenu = menus.find(m => m.id === settings.footerMenuId);

  const renderBlogTemplate = () => {
    switch (settings.blogTemplate) {
      case 'grid-sidebar':
        return <GridSidebarTemplate posts={publishedPosts} />;
      case 'list':
        return <ListTemplate posts={publishedPosts} />;
      case 'grid':
      default:
        return <GridTemplate posts={publishedPosts} />;
    }
  }


  return (
    <div className="flex flex-col min-h-screen">
       <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold">
            <Icons.logo className="h-6 w-6" />
            {settings.siteName || "Vinee CMS"}
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
               {headerMenu ? (
                  headerMenu.items.map((item, index) => (
                    <Button key={index} variant="ghost" asChild>
                      <Link href={item.url}>{item.label}</Link>
                    </Button>
                  ))
                ) : (
                  <Button asChild>
                    <Link href="/admin">Dashboard</Link>
                  </Button>
                )}
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{settings.siteName || "Vinee Blog"}</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    {settings.tagline || "Welcome to our blog. Here we share the latest stories and insights."}
                </p>
            </div>
            {renderBlogTemplate()}
        </div>
      </main>
      <footer className="border-t bg-muted/20 py-8">
        <div className="container flex flex-col items-center">
          {footerMenu && footerMenu.items.length > 0 && (
            <nav className="flex justify-center gap-4 mb-4">
              {footerMenu.items.map((item, index) => (
                <Link key={index} href={item.url} className="text-sm text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
          <div className="text-center text-sm text-muted-foreground">
             <HtmlRenderer htmlContent={settings.footerText || ''} />
          </div>
        </div>
      </footer>
    </div>
  );
}
