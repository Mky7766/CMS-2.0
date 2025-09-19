
import Link from "next/link";
import Image from "next/image";
import { posts, Menu, Page } from "@/lib/data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { getSettings, getPage } from "@/app/actions";
import fs from 'fs/promises';
import path from 'path';
import HtmlRenderer from "@/components/html-renderer";
import GridTemplate from "@/components/blog-templates/grid-template";
import GridSidebarTemplate from "@/components/blog-templates/grid-sidebar-template";
import ListTemplate from "@/components/blog-templates/list-template";
import SiteHeader from "@/components/site-header";


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

  let homePage: Page | undefined;
  if (settings.homepagePageId && settings.homepagePageId !== 'latest-posts') {
      homePage = await getPage(settings.homepagePageId);
  }

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
       <SiteHeader settings={settings} headerMenu={headerMenu} />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
            { homePage ? (
                 <article className="prose prose-lg mx-auto max-w-4xl dark:prose-invert">
                    <header className="mb-8">
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{homePage.title}</h1>
                    </header>
                    <HtmlRenderer htmlContent={homePage.content} />
                </article>
            ) : (
                <>
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{settings.siteName || "Vinee Blog"}</h1>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            {settings.tagline || "Welcome to our blog. Here we share the latest stories and insights."}
                        </p>
                    </div>
                    {renderBlogTemplate()}
                </>
            )}
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
