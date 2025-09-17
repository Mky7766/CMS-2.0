
import { posts } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function PostCard({ post }: { post: (typeof posts)[0] }) {
    return (
        <Card className="flex flex-col overflow-hidden">
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
    )
}

export default function GridSidebarTemplate({ posts }: { posts: (typeof posts) }) {
    const mainPosts = posts.slice(0, 5);
    const sidebarPosts = posts.slice(5, 10);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 grid gap-8 md:grid-cols-2">
                 {mainPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
            <aside className="lg:col-span-1">
                <div className="sticky top-24">
                    <h3 className="text-2xl font-bold mb-4">Recent Posts</h3>
                    <div className="space-y-4">
                        {sidebarPosts.map(post => (
                             <Link key={post.id} href={`/${post.id}`} className="block group">
                                <p className="font-semibold group-hover:text-primary">{post.title}</p>
                                <p className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    )
}
