import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { posts, pages } from "@/lib/data";
import { FileText, ArrowUpRight, User as UserIcon, ExternalLink, File as PageIcon, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { users } from "@/lib/data";
import PostActions from "@/components/admin/post-actions";
import AnalyticsSummaryCard from "@/components/admin/analytics-summary-card";
import AnalyticsChart from "@/components/admin/analytics-chart";


const iconMap: { [key: string]: React.ElementType } = {
  FileText,
  PageIcon,
  UserIcon,
};

export default function DashboardPage() {
  const recentPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const totalPosts = posts.length;
  const totalUsers = users.length;
  const totalPages = pages.length;

  const dashboardStats = [
    { title: "Total Posts", value: totalPosts.toString(), icon: FileText },
    { title: "Total Pages", value: totalPages.toString(), icon: PageIcon },
    { title: "Total Users", value: totalUsers.toString(), icon: UserIcon },
  ];
  
  const analyticsStats = [
      { title: "Total Visitors", value: "15,230", icon: Users, change: "+20.1%", changeType: "increase" as const },
      { title: "Unique Visitors", value: "12,810", icon: UserIcon, change: "+18.3%", changeType: "increase" as const },
      { title: "Page Views", value: "54,980", icon: Eye, change: "+5.2%", changeType: "decrease" as const },
  ]


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here&apos;s a summary of your site.</p>
        </div>
        <Button asChild variant="outline">
            <Link href="/" target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Site
            </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {analyticsStats.map((stat) => (
            <AnalyticsSummaryCard key={stat.title} {...stat} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        <AnalyticsChart />
        
        <Card className="lg:col-span-3">
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
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
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
    </div>
  );
}
