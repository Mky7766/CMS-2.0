import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { posts } from "@/lib/data";
import { PlusCircle, File, ListFilter } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import PostActions from "@/components/admin/post-actions";

type PostTableProps = {
    posts: typeof posts;
}

function PostsTable({ posts }: PostTableProps) {
    if (posts.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12">
                No posts found.
            </div>
        )
    }

    return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Author</span>
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">
                Created at
              </TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="hidden sm:table-cell">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                  <Badge variant={post.status.toLowerCase() === 'published' ? 'default' : post.status.toLowerCase() === 'draft' ? 'secondary' : 'outline'}>{post.status}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {post.createdAt}
                </TableCell>
                <TableCell className="text-right">
                    <PostActions postId={post.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    )
}

export default function PostsPage() {
  const allPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const publishedPosts = allPosts.filter(p => p.status.toLowerCase() === "published");
  const draftPosts = allPosts.filter(p => p.status.toLowerCase() === "draft");
  const scheduledPosts = allPosts.filter(p => p.status.toLowerCase() === "scheduled");

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
            <p className="text-muted-foreground">Manage your blog posts and content.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <Button size="sm" asChild className="h-8 gap-1">
            <Link href="/admin/posts/new">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                New Post
              </span>
            </Link>
          </Button>
        </div>
      </div>
      <TabsList className="mt-4">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="published">Published</TabsTrigger>
        <TabsTrigger value="draft">Draft</TabsTrigger>
        <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
      </TabsList>
      <Card className="mt-4">
        <CardContent className="pt-6">
            <TabsContent value="all">
                <PostsTable posts={allPosts} />
            </TabsContent>
            <TabsContent value="published">
                <PostsTable posts={publishedPosts} />
            </TabsContent>
            <TabsContent value="draft">
                <PostsTable posts={draftPosts} />
            </TabsContent>
            <TabsContent value="scheduled">
                <PostsTable posts={scheduledPosts} />
            </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
