import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Post, Page, User } from "@/lib/data";
import { FileText, User as UserIcon, ExternalLink, File as PageIcon, Users, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PostActions from "@/components/admin/post-actions";
import fs from 'fs/promises';
import path from 'path';

async function getPosts(): Promise<Post[]> {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'posts.json');
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function getPages(): Promise<Page[]> {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'pages.json');
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function getUsers(): Promise<User[]> {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'users.json');
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}


export default async function DashboardPage() {
  const [allPosts, allPages, allUsers] = await Promise.all([
    getPosts(),
    getPages(),
    getUsers(),
  ]);
  
  const recentPosts = [...allPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const totalPosts = allPosts.length;
  const totalUsers = allUsers.length;
  const totalPages = allPages.length;
  

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's a summary of your site.</p>
        </div>
        <Button asChild variant="outline">
            <Link href="/" target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Site
            </Link>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalPosts}</div>
                 <p className="text-xs text-muted-foreground">Total posts on your site</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
                <PageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalPages}</div>
                 <p className="text-xs text-muted-foreground">Total pages on your site</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                 <p className="text-xs text-muted-foreground">Total registered users</p>
            </CardContent>
        </Card>
      </div>
      
       <div className="grid gap-4 md:grid-cols-1">
          <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
                <CardTitle>Recent Posts</CardTitle>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/admin/posts">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="font-medium">{post.title}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        by {post.author.name}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={post.status === 'Published' ? 'default' : post.status === "Draft" ? "secondary" : "outline"}>
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <PostActions postId={post.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
