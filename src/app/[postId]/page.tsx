
import { posts, Menu, pages, Page } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/app/actions";
import HtmlRenderer from "@/components/html-renderer";
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

async function getPage(pageId: string): Promise<Page | undefined> {
    // This is a simplified fetch, in a real app this would be a DB query
    return pages.find(p => p.id === pageId);
}

export default async function PostPage({ params }: { params: { postId: string } }) {
  const post = posts.find(p => p.id === params.postId);
  const page = await getPage(params.postId);

  const settings = await getSettings();
  const menus = await getMenus();
  const headerMenu = menus.find(m => m.id === settings.headerMenuId);
  const footerMenu = menus.find(m => m.id === settings.footerMenuId);


  if (!post && !page) {
    notFound();
  }

  if (page) {
    return (
        <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
            <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold">
                <Icons.logo className="h-6 w-6" />
                {settings.siteName}
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
          <article className="prose prose-lg mx-auto max-w-4xl dark:prose-invert">
            <header className="mb-8">
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{page.title}</h1>
            </header>
            <HtmlRenderer htmlContent={page.content} />
          </article>
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
    )
  }

  return (
     <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
            <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold">
                <Icons.logo className="h-6 w-6" />
                {settings.siteName}
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
           {post && post.featuredImage && (
             <div className="mb-8 aspect-video overflow-hidden rounded-lg">
                <Image
                    src={post.featuredImage.url}
                    alt={post.featuredImage.alt}
                    width={1200}
                    height={675}
                    className="w-full h-full object-cover"
                    priority
                    unoptimized={post.featuredImage.url.startsWith('data:')}
                />
             </div>
           )}
          <article className="prose prose-lg mx-auto max-w-4xl dark:prose-invert">
            <header className="mb-8">
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{post.title}</h1>
              <div className="mt-4 flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                   <Avatar className="h-9 w-9">
                        <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                        <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  <span>{post.author.name}</span>
                </div>
                <span>&middot;</span>
                 <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
              </div>
            </header>
            <HtmlRenderer htmlContent={post.content} />
          </article>
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
