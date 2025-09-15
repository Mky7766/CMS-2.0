import Link from "next/link";
import { posts } from "@/lib/data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export default function Home() {
  const publishedPosts = posts.filter(p => p.status === 'Published').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex flex-col min-h-screen">
       <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold">
            <Icons.logo className="h-6 w-6" />
            Nebula CMS
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
               <Button asChild>
                <Link href="/admin">
                  Dashboard
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Nebula Blog</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Welcome to our blog. Here we share the latest stories and insights.
                </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {publishedPosts.map((post) => (
                <Card key={post.id}>
                    <CardHeader>
                        <CardTitle className="text-2xl hover:text-primary transition-colors">
                            <Link href={`/blog/${post.id}`}>{post.title}</Link>
                        </CardTitle>
                        <CardDescription>
                            <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>{post.content.substring(0, 150)}{post.content.length > 150 ? '...' : ''}</p>
                    </CardContent>
                    <CardFooter className="flex items-center gap-3">
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
      <footer className="p-4 text-center text-sm text-muted-foreground border-t">
        Built with &#x2764;&#xFE0F; by the open-source community.
      </footer>
    </div>
  );
}
