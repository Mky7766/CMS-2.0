"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const dailyData = [
  { date: "Mon", visitors: 22 },
  { date: "Tue", visitors: 45 },
  { date: "Wed", visitors: 76 },
  { date: "Thu", visitors: 54 },
  { date: "Fri", visitors: 98 },
  { date: "Sat", visitors: 124 },
  { date: "Sun", visitors: 145 },
];

const monthlyData = [
  { date: "Jan", visitors: 450 },
  { date: "Feb", visitors: 780 },
  { date: "Mar", visitors: 990 },
  { date: "Apr", visitors: 820 },
  { date: "May", visitors: 1230 },
  { date: "Jun", visitors: 1540 },
];

export default function AnalyticsChart() {
  return (
    <Card className="lg:col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Traffic Analytics</CardTitle>
          <CardDescription>
            Visitors insights for your website.
          </CardDescription>
        </div>
        <Tabs defaultValue="daily" className="w-[150px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily">
          <TabsContent value="daily">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                  cursor={{ fill: "hsl(var(--muted))" }}
                />
                <Bar
                  dataKey="visitors"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="monthly">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                   cursor={{ fill: "hsl(var(--muted))" }}
                />
                <Bar
                  dataKey="visitors"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
