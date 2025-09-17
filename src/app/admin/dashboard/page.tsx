import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { posts, pages } from "@/lib/data";
import { FileText, CheckCircle, Edit3, ArrowUpRight, User as UserIcon, ExternalLink, File as PageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { users } from "@/lib/data";
import DashboardChart from "@/components/admin/dashboard-chart";
import PostActions from "@/components/admin/post-actions";

const iconMap: { [key: string]: React.ElementType } = {
  FileText,
  CheckCircle,
  Edit3,
  UserIcon,
  PageIcon
};

export default function DashboardPage() {
  const recentPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const totalPosts = posts.length;
  const publishedPosts = posts.filter(p => p.status === 'Published').length;
  const draftPosts = posts.filter(p => p.status === 'Draft').length;
  const totalUsers = users.length;
  const totalPages = pages.length;

  const dashboardStats = [
    { title: "Total Posts", value: totalPosts, icon: "FileText" },
    { title: "Published Posts", value: publishedPosts, icon: "CheckCircle" },
    { title: "Total Pages", value: totalPages, icon: "PageIcon" },
    { title: "Total Users", value: totalUsers, icon: "UserIcon" },
  ];

  const postsByMonth = posts.reduce((acc, post) => {
    const month = new Date(post.createdAt).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(postsByMonth).map(month => ({
    month,
    posts: postsByMonth[month],
  })).reverse();


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here&apos;s a summary of your content.</p>
        </div>
        <Button asChild variant="outline">
            <Link href="/" target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Site
            </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => {
          const Icon = iconMap[stat.icon];
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
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
                  <TableHead className="hidden md:table-cell text-right">Date</TableHead>
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
                    <TableCell className="hidden md:table-cell text-right">{post.createdAt}</TableCell>
                    <TableCell className="text-right">
                        <PostActions postId={post.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Posts per Month</CardTitle>
          </CardHeader>
           <CardContent>
              <DashboardChart chartData={chartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
