
import { posts, users } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck } from "lucide-react";

function ListPostCard({ post }: { post: (typeof posts)[0] }) {
    const author = users.find(u => u.id === post.authorId);
    return (
        <Card className="flex flex-col md:flex-row overflow-hidden">
             {post.featuredImage && (
                <Link href={`/${post.id}`} className="block md:w-1/3">
                    <Image
                        src={post.featuredImage.url}
                        alt={post.featuredImage.alt}
                        width={400}
                        height={250}
                        className="w-full h-full object-cover"
                        unoptimized={post.featuredImage.url.startsWith('data:')}
                    />
                </Link>
            )}
            <div className="flex flex-col flex-1">
                <CardHeader>
                    <CardTitle className="text-2xl hover:text-primary transition-colors">
                        <Link href={`/${post.id}`}>{post.title}</Link>
                    </CardTitle>
                    <CardDescription>
                        <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p>{post.content.substring(0, 200)}{post.content.length > 200 ? '...' : ''}</p>
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
            </div>
        </Card>
    )
}

export default function ListTemplate({ posts }: { posts: (typeof posts) }) {
    return (
        <div className="space-y-8">
            {posts.map((post) => (
                <ListPostCard key={post.id} post={post} />
            ))}
        </div>
    )
}
