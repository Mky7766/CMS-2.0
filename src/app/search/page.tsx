
import { Suspense } from 'react';
import Link from "next/link";
import { getPosts, getSettings, getMenus } from "@/app/actions";
import SiteHeader from "@/components/site-header";
import GridTemplate from '@/components/blog-templates/grid-template';
import HtmlRenderer from '@/components/html-renderer';

async function SearchResults({ query }: { query: string }) {
  const allPosts = await getPosts();
  const publishedPosts = allPosts.filter(p => p.status.toLowerCase() === 'published');
  
  const filteredPosts = publishedPosts.filter(post => 
    post.title.toLowerCase().includes(query.toLowerCase()) || 
    post.content.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Search Results</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Found {filteredPosts.length} {filteredPosts.length === 1 ? "result" : "results"} for &quot;{query}&quot;
        </p>
      </div>

      {filteredPosts.length > 0 ? (
        <GridTemplate posts={filteredPosts} />
      ) : (
        <div className="text-center text-muted-foreground">
          <p>Sorry, we couldn&apos;t find any posts matching your search.</p>
          <p className="mt-2">Try searching for something else.</p>
        </div>
      )}
    </>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: {
    q?: string;
  };
}) {
  const settings = await getSettings();
  const menus = await getMenus();
  const headerMenu = menus.find(m => m.id === settings.headerMenuId);
  const footerMenu = menus.find(m => m.id === settings.footerMenuId);

  const query = searchParams?.q || "";

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader settings={settings} headerMenu={headerMenu} />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Suspense fallback={<div>Loading...</div>}>
            <SearchResults query={query} />
          </Suspense>
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

    