"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  Activity,
} from "lucide-react";

interface UsageData {
  userConsumption: { date: Date; consumption: number }[];
  totalConsumption: { date: Date; consumption: number }[];
}

interface UsageChartProps {
  data: UsageData;
  timePeriod: string;
  isLoading?: boolean;
  totalUserConsumption: number;
  totalOverallConsumption: number;
}

type ChartType = "line" | "bar" | "area";

const chartConfig = {
  userConsumption: {
    label: "Your Consumption",
    color: "hsl(var(--chart-1))",
  },
  totalConsumption: {
    label: "Total Consumption",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function UsageChart({
  data,
  timePeriod,
  isLoading,
  totalUserConsumption,
  totalOverallConsumption,
}: UsageChartProps) {
  const [chartType, setChartType] = useState<ChartType>("bar");

  // Transform and merge data for chart consumption
  const chartData = React.useMemo(buildChartData(), [data]);

  const userPercentage =
    totalOverallConsumption > 0
      ? (totalUserConsumption / totalOverallConsumption) * 100
      : 0;

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: {
        left: 12,
        right: 12,
      },
    };

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value} kWh`}
              domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="userConsumption" fill="var(--chart-1)" radius={4} />
            <Bar dataKey="totalConsumption" fill="var(--chart-2)" radius={4} />
          </BarChart>
        );
      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value} kWh`}
              domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="userConsumption"
              type="natural"
              fill="var(--chart-1)"
              fillOpacity={0.4}
              stroke="var(--chart-1)"
              stackId="a"
            />
            <Area
              dataKey="totalConsumption"
              type="natural"
              fill="var(--chart-2)"
              fillOpacity={0.4}
              stroke="var(--chart-2)"
              stackId="a"
            />
          </AreaChart>
        );
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value} kWh`}
              domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="userConsumption"
              type="natural"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{
                fill: "var(--chart-1)",
              }}
              activeDot={{
                r: 6,
              }}
            />
            <Line
              dataKey="totalConsumption"
              type="natural"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={{
                fill: "var(--chart-2)",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Power Consumption Chart</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center">
            <div className="text-muted-foreground text-sm">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Power Consumption Chart</CardTitle>
          <CardDescription>
            No data available for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center">
            <div className="text-muted-foreground text-sm">
              No data to display
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Power Consumption Overview</CardTitle>
          <CardDescription>
            Showing consumption data for {timePeriod.toLowerCase()}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant={chartType === "line" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("line")}
          >
            <LineChartIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={chartType === "bar" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("bar")}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button
            variant={chartType === "area" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("area")}
          >
            <Activity className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full"
        >
          {renderChart()}
        </ChartContainer>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              <TrendingUp className="h-4 w-4" />
              Your usage represents {userPercentage.toFixed(1)}% of total
              consumption
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {totalUserConsumption.toFixed(2)} kWh of{" "}
              {totalOverallConsumption.toFixed(2)} kWh total
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  function buildChartData(): () => {
    date: string;
    userConsumption: number;
    totalConsumption: number;
  }[] {
    return () => {
      const dateMap = new Map<
        string,
        { date: string; userConsumption: number; totalConsumption: number }
      >();

      // Add user consumption data
      data.userConsumption.forEach(({ date, consumption }) => {
        const dateKey = format(date, "yyyy-MM-dd");
        const existingEntry = dateMap.get(dateKey) || {
          date: format(date, "MMM dd"),
          userConsumption: 0,
          totalConsumption: 0,
        };
        existingEntry.userConsumption = consumption;
        dateMap.set(dateKey, existingEntry);
      });

      // Add total consumption data
      data.totalConsumption.forEach(({ date, consumption }) => {
        const dateKey = format(date, "yyyy-MM-dd");
        const existingEntry = dateMap.get(dateKey) || {
          date: format(date, "MMM dd"),
          userConsumption: 0,
          totalConsumption: 0,
        };
        existingEntry.totalConsumption = consumption;
        dateMap.set(dateKey, existingEntry);
      });

      // Convert map to array and sort by date
      return Array.from(dateMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, value]) => value);
    };
  }
}
