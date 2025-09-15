import { posts } from "@/lib/data";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PostPage({ params }: { params: { postId: string } }) {
  const post = posts.find(p => p.id === params.postId);

  if (!post) {
    notFound();
  }

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
      <main className="flex-1 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4">
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
            <div className="whitespace-pre-wrap">{post.content}</div>
          </article>
        </div>
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground border-t">
        Built with &#x2764;&#xFE0F; by the open-source community.
      </footer>
    </div>
  );
}
