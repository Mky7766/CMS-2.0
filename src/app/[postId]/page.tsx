
import { Menu, pages, Page, SiteSettings, users, User, Post } from "@/lib/data";
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
import { Metadata } from 'next';
import SiteHeader from "@/components/site-header";
import GridTemplate from "@/components/blog-templates/grid-template";
import GridSidebarTemplate from "@/components/blog-templates/grid-sidebar-template";
import ListTemplate from "@/components/blog-templates/list-template";
import AuthorBioBox from "@/components/author-bio-box";
import { BadgeCheck } from "lucide-react";
import SocialShare from "@/components/social-share";
import { getSession } from "@/lib/session";

async function getPosts(): Promise<Post[]> {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'posts.json');
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data) as Post[];
    } catch (error) {
        return [];
    }
}

async function getPost(postId: string): Promise<Post | undefined> {
    const posts = await getPosts();
    return posts.find(p => p.id === postId);
}


export async function generateMetadata({ params }: { params: { postId: string } }): Promise<Metadata> {
  const post = await getPost(params.postId);
  const page = await getPage(params.postId);
  const settings = await getSettings();

  const title = page?.title || post?.title || settings.siteName;
  const description = post ? (post.content ? post.content.substring(0, 150) : '') : (settings.tagline || '');
  
  const metadata: Metadata = {
    title: `${title} | ${settings.siteName}`,
    description: description,
    icons: {
      icon: settings.faviconUrl || '/favicon.ico',
    },
  };

  if (post) {
      const author = users.find(u => u.id === post.authorId);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://localhost:3000`;

      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${siteUrl}/${post.id}`,
        },
        headline: post.title,
        description: post.content.substring(0, 150),
        image: post.featuredImage ? post.featuredImage.url : undefined,
        author: {
          '@type': 'Person',
          name: author ? author.name : post.author.name,
        },
        publisher: {
          '@type': 'Organization',
          name: settings.siteName,
          logo: {
            '@type': 'ImageObject',
            url: settings.logoUrl,
          },
        },
        datePublished: post.createdAt,
        dateModified: post.createdAt,
      };

      metadata.other = {
          'article-schema': <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      }
  }
  
  return metadata;
}


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
    const pagesPath = path.join(process.cwd(), 'src', 'lib', 'pages.json');
    try {
        const file = await fs.readFile(pagesPath, 'utf-8');
        const allPages = JSON.parse(file) as Page[];
        return allPages.find(p => p.id === pageId);
    } catch (error) {
        return undefined;
    }
}

export default async function PostPage({ params, searchParams }: { params: { postId: string }, searchParams?: { [key: string]: string | string[] | undefined }}) {
  const settings = await getSettings();
  const isPostsPage = settings.postsPageId && settings.postsPageId === params.postId;
  const session = await getSession();
  const isPreview = searchParams?.preview === 'true' && !!session;

  if (isPostsPage) {
    const page = await getPage(params.postId);
    const menus = await getMenus();
    const headerMenu = menus.find(m => m.id === settings.headerMenuId);
    const footerMenu = menus.find(m => m.id === settings.footerMenuId);
    
    const allPosts = await getPosts();
    const publishedPosts = allPosts.filter(p => p.status.toLowerCase() === 'published').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
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
                     <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{page?.title || "Blog"}</h1>
                        {page?.content && <div className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"><HtmlRenderer htmlContent={page.content} /></div>}
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
    )
  }

  const post = await getPost(params.postId);
  const page = await getPage(params.postId);
  const menus = await getMenus();
  const headerMenu = menus.find(m => m.id === settings.headerMenuId);
  const footerMenu = menus.find(m => m.id === settings.footerMenuId);


  if ((!post && !page) || (page && page.status.toLowerCase() !== 'published' && !isPreview) || (post && post.status.toLowerCase() !== 'published' && !isPreview)) {
    notFound();
  }

  if (page) {
    return (
        <div className="flex flex-col min-h-screen">
        <SiteHeader settings={settings} headerMenu={headerMenu} />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <article className="prose prose-lg mx-auto max-w-4xl dark:prose-invert">
            <header className="mb-8">
              {!page.hideTitle && (
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{page.title}</h1>
              )}
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
  
  if (!post) {
      notFound();
  }

  const author = users.find(u => u.id === post!.authorId);

  return (
     <div className="flex flex-col min-h-screen">
        <SiteHeader settings={settings} headerMenu={headerMenu} />
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
              {!post.hideTitle && (
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{post.title}</h1>
              )}
              <div className="mt-4 flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                   <Avatar className="h-9 w-9">
                        {author ? (
                            <>
                                <AvatarImage src={author.avatarUrl} alt={author.name} />
                                <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                            </>
                        ) : (
                             <>
                                <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                            </>
                        )}
                    </Avatar>
                  <span className="flex items-center gap-1">
                    {author ? author.name : post.author.name}
                    {author && (author.role === 'Admin' || author.role === 'Editor' || author.role === 'Author') && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                  </span>
                </div>
                <span>&middot;</span>
                 <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
              </div>
            </header>
            <HtmlRenderer htmlContent={post.content} />
          </article>
           <div className="mt-12 max-w-4xl mx-auto">
                <SocialShare post={post} />
            </div>
          {settings.showAuthorBio && author && (
            <div className="mt-8 max-w-4xl mx-auto">
                <AuthorBioBox author={author} />
            </div>
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
