import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { posts, dashboardStats } from "@/lib/data";
import { FileText, CheckCircle, Edit3, BarChart2, MoreVertical, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const iconMap: { [key: string]: React.ElementType } = {
  FileText,
  CheckCircle,
  Edit3,
  BarChart2,
};

export default function DashboardPage() {
  const recentPosts = posts.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s a summary of your content.</p>
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
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
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
                      <Badge variant={post.status === 'Published' ? 'default' : 'secondary'} className={`${post.status === 'Published' ? 'bg-primary/20 text-primary-foreground' : ''}`}>
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{post.createdAt}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
           <CardContent className="grid gap-8">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  New post published: "The Future of Web Dev"
                </p>
                <p className="text-sm text-muted-foreground">
                  by Jane Doe - 2 hours ago
                </p>
              </div>
            </div>
             <div className="flex items-center gap-4">
              <div className="rounded-full bg-accent/10 p-2">
                <Edit3 className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  Post updated: "Getting Started with Nebula"
                </p>
                <p className="text-sm text-muted-foreground">
                  by Alice Johnson - 5 hours ago
                </p>
              </div>
            </div>
             <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  New post scheduled: "The Power of Markdown"
                </p>
                <p className="text-sm text-muted-foreground">
                  by Charlie Davis - 1 day ago
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
