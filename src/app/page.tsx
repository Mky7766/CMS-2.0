
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


  return (
    <div className="flex flex-col min-h-screen">
       <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold">
            <Icons.logo className="h-6 w-6" />
            {settings.siteName || "Nebula CMS"}
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
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{settings.siteName || "Nebula Blog"}</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    {settings.tagline || "Welcome to our blog. Here we share the latest stories and insights."}
                </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {publishedPosts.map((post) => (
                <Card key={post.id} className="flex flex-col overflow-hidden">
                    {post.featuredImage && (
                        <Link href={`/${post.id}`} className="block aspect-video">
                            <Image
                                src={post.featuredImage.url}
                                alt={post.featuredImage.alt}
                                width={600}
                                height={400}
                                className="w-full h-full object-cover"
                                unoptimized={post.featuredImage.url.startsWith('data:')}
                            />
                        </Link>
                    )}
                    <CardHeader>
                        <CardTitle className="text-2xl hover:text-primary transition-colors">
                            <Link href={`/${post.id}`}>{post.title}</Link>
                        </CardTitle>
                        <CardDescription>
                            <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p>{post.content.substring(0, 150)}{post.content.length > 150 ? '...' : ''}</p>
                    </CardContent>
                    <CardFooter className="flex items-center gap-3 mt-auto">
                         <Avatar className="h-9 w-9">
                            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{post.author.name}</span>
                    </CardFooter>
                </Card>
                ))}
            </div>
        </div>
      </main>
      <footer className="border-t bg-muted/20 py-8">
        <div className="container">
          {footerMenu && footerMenu.items.length > 0 && (
            <nav className="flex justify-center gap-4 mb-4">
              {footerMenu.items.map((item, index) => (
                <Link key={index} href={item.url} className="text-sm text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
          <p className="text-center text-sm text-muted-foreground">
            Built with &#x2764;&#xFE0F; by the open-source community.
          </p>
        </div>
      </footer>
    </div>
  );
}
