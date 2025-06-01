import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Zap, BarChart3 } from "lucide-react";

interface UsageSummaryProps {
  userConsumption: number;
  totalConsumption: number;
  timePeriod: string;
  isLoading?: boolean;
  isDataAvailable?: boolean;
  selectedDeviceAlias: string;
}

export default function UsageSummary({
  userConsumption,
  totalConsumption,
  timePeriod,
  isLoading = false,
  isDataAvailable = false,
  selectedDeviceAlias,
}: UsageSummaryProps) {
  const userPercentage =
    totalConsumption > 0 ? (userConsumption / totalConsumption) * 100 : 0;
  const efficiency =
    userPercentage <= 50
      ? "excellent"
      : userPercentage <= 75
        ? "good"
        : "needs attention";

  //show loading state if isLoading is true or isDataAvailable is false
  const showLoading = isLoading || !isDataAvailable;

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
          {showLoading ? (
            <div className="bg-muted h-8 w-24 animate-pulse rounded"></div>
          ) : (
            <div className="text-2xl font-bold">
              {userConsumption.toFixed(2)} kWh
            </div>
          )}
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
          {showLoading ? (
            <div className="bg-muted h-8 w-24 animate-pulse rounded"></div>
          ) : (
            <div className="text-2xl font-bold">
              {totalConsumption.toFixed(2)} kWh
            </div>
          )}
          <p className="text-muted-foreground text-xs">
            {selectedDeviceAlias === "All"
              ? "All devices combined"
              : `For ${selectedDeviceAlias}`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Your Share</CardTitle>
          <TrendingUp className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          {showLoading ? (
            <div className="bg-muted h-8 w-16 animate-pulse rounded"></div>
          ) : (
            <div className="text-2xl font-bold">
              {userPercentage.toFixed(1)}%
            </div>
          )}
          <p className="text-muted-foreground text-xs">
            Usage efficiency:{" "}
            {showLoading ? (
              <span className="bg-muted inline-block h-3 w-16 animate-pulse rounded"></span>
            ) : (
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
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
