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
import { type TimePeriod } from "@/lib/usage-utils";

interface UsageData {
  userConsumption: { date: Date; consumption: number }[];
  totalConsumption: { date: Date; consumption: number }[];
}

export interface UsageChartProps {
  data: UsageData | undefined;
  timePeriod: TimePeriod;
  isFetchingData?: boolean;
  totalUserConsumption: number;
  totalOverallConsumption: number;
  isDataAvailable: boolean;
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

// Container
export default function UsageChart({
  data,
  timePeriod,
  isFetchingData,
  totalUserConsumption,
  totalOverallConsumption,
  isDataAvailable,
}: UsageChartProps) {
  const [chartType, setChartType] = useState<ChartType>("bar");

  // Transform and merge data for chart consumption
  const chartData = React.useMemo(buildChartData, [data]);

  const userPercentage =
    totalOverallConsumption > 0
      ? (totalUserConsumption / totalOverallConsumption) * 100
      : 0;
  const showLoading = Boolean(isFetchingData) || !Boolean(isDataAvailable);
  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        {/* title and description */}
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Power Consumption Overview</CardTitle>
          <CardDescription>
            Showing consumption data for {timePeriod.toLowerCase()}
          </CardDescription>
        </div>
        {/* chart type selector */}
        <div className="flex gap-2">
          <Button
            variant={chartType === "line" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("line")}
            disabled={showLoading}
            aria-label="Line chart"
            aria-pressed={chartType === "line"}
          >
            <LineChartIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={chartType === "bar" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("bar")}
            disabled={showLoading}
            aria-label="Bar chart"
            aria-pressed={chartType === "bar"}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button
            variant={chartType === "area" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("area")}
            disabled={showLoading}
            aria-label="Area chart"
            aria-pressed={chartType === "area"}
          >
            <Activity className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {/* chart */}
        {showLoading ? (
          <div className="flex h-[350px] items-center justify-center">
            <div className="text-muted-foreground text-sm">
              Loading chart...
            </div>
          </div>
        ) : !chartData.length ? (
          <div className="flex h-[350px] items-center justify-center">
            <div className="text-muted-foreground text-sm">
              No data to display
            </div>
          </div>
        ) : (
          <div data-testid={chartType}>
            <TheChart chartData={chartData} chartType={chartType} />
          </div>
        )}

        {/* chart footer: user percentage and total consumption */}
        <div className="flex w-full flex-col items-center justify-center gap-2 pt-4 text-sm">
          <div className="flex items-center justify-center gap-2 leading-none font-medium">
            <TrendingUp className="h-4 w-4" />
            Your usage represents{" "}
            {showLoading ? (
              <span className="bg-muted inline-block h-4 w-8 animate-pulse rounded"></span>
            ) : (
              userPercentage.toFixed(1)
            )}
            % of total consumption
          </div>
          <div className="text-muted-foreground flex items-center justify-center gap-2 leading-none">
            {showLoading ? (
              <>
                <span className="bg-muted inline-block h-3 w-12 animate-pulse rounded"></span>
                {" kWh of "}
                <span className="bg-muted inline-block h-3 w-12 animate-pulse rounded"></span>
                {" kWh total"}
              </>
            ) : (
              <>
                {totalUserConsumption.toFixed(2)} kWh of{" "}
                {totalOverallConsumption.toFixed(2)} kWh total
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  function buildChartData(): ChartDataItem[] {
    if (!data) {
      return [];
    }
    const dateMap = new Map<string, ChartDataItem>();

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
  }
}

type ChartDataItem = {
  date: string;
  userConsumption: number;
  totalConsumption: number;
};

// Presentation
function TheChart({
  chartData,
  chartType,
}: {
  chartData: ChartDataItem[];
  chartType: ChartType;
}) {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[350px] w-full"
    >
      {renderChart()}
    </ChartContainer>
  );

  function renderChart() {
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
            />
            <Area
              dataKey="totalConsumption"
              type="natural"
              fill="var(--chart-2)"
              fillOpacity={0.4}
              stroke="var(--chart-2)"
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
  }
}
