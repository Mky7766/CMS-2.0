import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageView } from "@/lib/data";
import { Signal, Eye, Users } from "lucide-react";
import AnalyticsChart from "@/components/admin/analytics-chart";
import RecentActivityCard from "@/components/admin/recent-activity-card";
import fs from 'fs/promises';
import path from 'path';

async function getAnalyticsData() {
    const analyticsPath = path.join(process.cwd(), 'src', 'lib', 'analytics.json');
    try {
        const file = await fs.readFile(analyticsPath, 'utf-8');
        const data = JSON.parse(file) as { pageViews: PageView[] };
        return data.pageViews;
    } catch (error) {
        return [];
    }
}

function getStatsFromPageViews(pageViews: PageView[]) {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const recentActivity = pageViews
        .filter(view => new Date(view.timestamp) >= fiveMinutesAgo)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const activeUsers = recentActivity.length;

    // For chart data (daily for last 7 days)
    const dailyCounts: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const day = d.toLocaleDateString('en-US', { weekday: 'short' });
        dailyCounts[day] = 0;
    }
    pageViews.forEach(view => {
        const viewDate = new Date(view.timestamp);
        if (viewDate > new Date(new Date().setDate(new Date().getDate() - 7))) {
            const day = viewDate.toLocaleDateString('en-US', { weekday: 'short' });
            if (dailyCounts[day] !== undefined) {
                dailyCounts[day]++;
            }
        }
    });

    // For chart data (monthly for last 6 months)
    const monthlyCounts: { [key: string]: number } = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const month = d.toLocaleDateString('en-US', { month: 'short' });
        monthlyCounts[month] = 0;
    }
    pageViews.forEach(view => {
        const viewDate = new Date(view.timestamp);
         if (viewDate > new Date(new Date().setMonth(new Date().getMonth() - 6))) {
            const month = viewDate.toLocaleDateString('en-US', { month: 'short' });
             if (monthlyCounts[month] !== undefined) {
                monthlyCounts[month]++;
            }
        }
    });

    const dailyData = Object.entries(dailyCounts).map(([date, visitors]) => ({ date, visitors }));
    const monthlyData = Object.entries(monthlyCounts).map(([date, visitors]) => ({ date, visitors }));
    
    // Unique visitors (very basic implementation - unique paths in last 5 mins)
    const uniquePathsLast5Min = new Set(recentActivity.map(v => v.path)).size;


    return {
        activeUsers,
        pageViewsCount: pageViews.length,
        dailyData,
        monthlyData,
        recentActivity,
        uniqueVisitors: uniquePathsLast5Min,
    };
}


export default async function AnalyticsPage() {
  const analyticsPageViews = await getAnalyticsData();
  
  const { 
    activeUsers,
    pageViewsCount,
    dailyData,
    monthlyData,
    recentActivity,
    uniqueVisitors,
  } = getStatsFromPageViews(analyticsPageViews);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">An overview of your website's traffic.</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Real-time Users</CardTitle>
                <Signal className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{activeUsers}</div>
                <p className="text-xs text-muted-foreground">Users active in the last 5 minutes</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{pageViewsCount}</div>
                 <p className="text-xs text-muted-foreground">Total page views recorded</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Visitors (5 min)</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{uniqueVisitors}</div>
                 <p className="text-xs text-muted-foreground">Unique sessions in the last 5 minutes</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AnalyticsChart dailyData={dailyData} monthlyData={monthlyData} />
        
        <RecentActivityCard recentActivity={recentActivity} />
      </div>
    </div>
  );
}
