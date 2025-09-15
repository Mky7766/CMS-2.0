"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const chartConfig = {
  posts: {
    label: "Posts",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

type DashboardChartProps = {
    chartData: { month: string; posts: number }[];
}

export default function DashboardChart({ chartData }: DashboardChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="posts" fill="var(--color-posts)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
