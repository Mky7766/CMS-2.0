"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageView } from "@/lib/data";
import { formatDistanceToNow } from "date-fns";

type RecentActivityCardProps = {
    recentActivity: PageView[];
}

export default function RecentActivityCard({ recentActivity }: RecentActivityCardProps) {
    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                    What your visitors have been looking at.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {recentActivity.length > 0 ? recentActivity.map((view, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <Link href={view.path} className="font-medium hover:underline truncate" title={view.path}>
                            {view.path}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(view.timestamp), { addSuffix: true })}
                        </span>
                    </div>
                )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity to show.</p>
                )}
            </CardContent>
        </Card>
    )
}
