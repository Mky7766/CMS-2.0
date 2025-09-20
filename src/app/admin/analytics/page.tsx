
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageView } from "@/lib/data";
import { Signal, Eye, Users, Loader2 } from "lucide-react";
import AnalyticsChart from "@/components/admin/analytics-chart";
import RecentActivityCard from "@/components/admin/recent-activity-card";
import TrafficSourceChart from "@/components/admin/traffic-source-chart";
import TopReferrersCard from "@/components/admin/top-referrers-card";
import { getAnalyticsData } from "@/app/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TimeFrame = 'all' | 'today' | 'week' | 'month';

function getStatsFromPageViews(pageViews: PageView[], timeFrame: TimeFrame = 'all') {
    const now = new Date();
    const host = typeof window !== 'undefined' ? window.location.host : '';

    // --- Time Frame Filtering ---
    const getFilteredViews = () => {
        if (timeFrame === 'today') {
            const todayStart = new Date(now.setHours(0, 0, 0, 0));
            return pageViews.filter(v => new Date(v.timestamp) >= todayStart);
        }
        if (timeFrame === 'week') {
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            weekStart.setHours(0, 0, 0, 0);
            return pageViews.filter(v => new Date(v.timestamp) >= weekStart);
        }
        if (timeFrame === 'month') {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return pageViews.filter(v => new Date(v.timestamp) >= monthStart);
        }
        return pageViews; // 'all'
    };

    const filteredPageViews = getFilteredViews();
    
    // --- Overall Stats (not affected by timeFrame) ---
    const fiveMinutesAgo = new Date(new Date().getTime() - 5 * 60 * 1000);
    const recentActivity = pageViews
        .filter(view => new Date(view.timestamp) >= fiveMinutesAgo)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const activeUsers = recentActivity.length;
    const uniqueVisitorsLast5Min = new Set(recentActivity.map(v => v.path)).size;

    // --- Chart Data (Daily/Monthly for Bar Chart) ---
    const dailyCounts: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(new Date().getDate() - i);
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
    const dailyData = Object.entries(dailyCounts).map(([date, visitors]) => ({ date, visitors }));

    const monthlyCounts: { [key: string]: { [key:string]: number } } = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(new Date().getMonth() - i);
        const month = d.toLocaleDateString('en-US', { month: 'short' });
        monthlyCounts[month] = { visitors: 0 };
    }
    pageViews.forEach(view => {
        const viewDate = new Date(view.timestamp);
        if (viewDate > new Date(new Date().setMonth(new Date().getMonth() - 6))) {
            const month = viewDate.toLocaleDateString('en-US', { month: 'short' });
            if (monthlyCounts[month] !== undefined) {
                monthlyCounts[month].visitors++;
            }
        }
    });
    const monthlyData = Object.entries(monthlyCounts).map(([date, { visitors }]) => ({ date, visitors }));


    // --- Time-framed Stats ---
    const sourceCounts = filteredPageViews.reduce((acc, view) => {
        const source = view.source || 'Other';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
    }, {} as { [key: string]: number });

    const trafficSourceData = Object.entries(sourceCounts).map(([name, value]) => ({ name, value }));
    
    const referrerCounts = filteredPageViews.reduce((acc, view) => {
        if (view.referrer && view.source !== 'Direct' && view.source !== 'Social' && view.source !== 'Google') {
            try {
                const url = new URL(view.referrer);
                if (url.hostname !== host) {
                    acc[url.hostname] = (acc[url.hostname] || 0) + 1;
                }
            } catch (e) {
                // Ignore invalid URLs
            }
        }
        return acc;
    }, {} as { [key: string]: number });
    
    const topReferrers = Object.entries(referrerCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));

    return {
        activeUsers,
        pageViewsCount: pageViews.length,
        dailyData,
        monthlyData,
        recentActivity,
        uniqueVisitors: uniqueVisitorsLast5Min,
        trafficSourceData,
        topReferrers
    };
}


export default function AnalyticsPage() {
    const [allPageViews, setAllPageViews] = useState<PageView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('all');

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const { pageViews } = await getAnalyticsData();
            setAllPageViews(pageViews);
            setIsLoading(false);
        }
        loadData();
    }, []);

    const stats = getStatsFromPageViews(allPageViews, timeFrame);
    const {
        activeUsers,
        pageViewsCount,
        dailyData,
        monthlyData,
        recentActivity,
        uniqueVisitors,
        trafficSourceData,
        topReferrers
    } = stats;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

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
                        <CardTitle className="text-sm font-medium">Page Views (All Time)</CardTitle>
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

            <div className="border-t pt-8">
                <Tabs defaultValue="all" onValueChange={(value) => setTimeFrame(value as TimeFrame)} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 max-w-lg mx-auto">
                        <TabsTrigger value="all">All-Time</TabsTrigger>
                        <TabsTrigger value="today">Today</TabsTrigger>
                        <TabsTrigger value="week">This Week</TabsTrigger>
                        <TabsTrigger value="month">This Month</TabsTrigger>
                    </TabsList>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                        <TrafficSourceChart data={trafficSourceData} />
                        <TopReferrersCard referrers={topReferrers} />
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
    