
import { Post, User } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck } from "lucide-react";
import { getUsers } from "@/app/actions";

async function PostCard({ post }: { post: Post }) {
    const users = await getUsers();
    const author = users.find(u => u.id === post.authorId);
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
                <span className="text-sm font-medium flex items-center gap-1">
                    {author ? author.name : post.author.name}
                    {author && (author.role === 'Admin' || author.role === 'Editor' || author.role === 'Author') && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                </span>
            </CardFooter>
        </Card>
    )
}

export default function GridTemplate({ posts }: { posts: Post[] }) {
    return (
         <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    )
}

    