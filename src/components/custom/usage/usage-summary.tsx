import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Zap, BarChart3 } from "lucide-react";

interface UsageSummaryProps {
  userConsumption: number;
  totalConsumption: number;
  timePeriod: string;
}

export default function UsageSummary({
  userConsumption,
  totalConsumption,
  timePeriod,
}: UsageSummaryProps) {
  const userPercentage =
    totalConsumption > 0 ? (userConsumption / totalConsumption) * 100 : 0;
  const efficiency =
    userPercentage <= 50
      ? "excellent"
      : userPercentage <= 75
        ? "good"
        : "needs attention";

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Your Consumption
          </CardTitle>
          <Zap className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {userConsumption.toFixed(2)} kWh
          </div>
          <p className="text-muted-foreground text-xs">
            For {timePeriod.toLowerCase()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Consumption
          </CardTitle>
          <BarChart3 className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalConsumption.toFixed(2)} kWh
          </div>
          <p className="text-muted-foreground text-xs">All devices combined</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Your Share</CardTitle>
          <TrendingUp className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userPercentage.toFixed(1)}%</div>
          <p className="text-muted-foreground text-xs">
            Usage efficiency:{" "}
            <span
              className={`font-medium ${
                efficiency === "excellent"
                  ? "text-green-600"
                  : efficiency === "good"
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {efficiency}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
