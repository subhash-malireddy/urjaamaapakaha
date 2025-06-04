import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, User, House } from "lucide-react";

interface UsageSummaryProps {
  userConsumption: number;
  totalConsumption: number;
  timePeriod: string;
  isFetchingData?: boolean;
  isDataAvailable?: boolean;
  selectedDeviceAlias: string;
}

export default function UsageSummary({
  userConsumption,
  totalConsumption,
  timePeriod,
  isFetchingData,
  isDataAvailable,
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
  const showLoading = Boolean(isFetchingData) || !Boolean(isDataAvailable);

  return (
    <div>
      {/* Desktop view */}
      <DesktopView
        userConsumption={userConsumption}
        totalConsumption={totalConsumption}
        userPercentage={userPercentage}
        efficiency={efficiency}
        timePeriod={timePeriod}
        selectedDeviceAlias={selectedDeviceAlias}
        showLoading={showLoading}
      />

      {/* Mobile view */}
      <MobileView
        userConsumption={userConsumption}
        totalConsumption={totalConsumption}
        userPercentage={userPercentage}
        efficiency={efficiency}
        showLoading={showLoading}
      />
    </div>
  );
}

interface ViewProps {
  userConsumption: number;
  totalConsumption: number;
  userPercentage: number;
  efficiency: string;
  timePeriod: string;
  selectedDeviceAlias: string;
  showLoading: boolean;
}

function DesktopView({
  userConsumption,
  totalConsumption,
  userPercentage,
  efficiency,
  timePeriod,
  selectedDeviceAlias,
  showLoading,
}: ViewProps) {
  return (
    <div
      className="hidden gap-4 md:grid md:grid-cols-3"
      data-testid="desktop-view"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Your Consumption
          </CardTitle>
          <User className="text-muted-foreground h-4 w-4" />
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
          <House className="text-muted-foreground h-4 w-4" />
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
                    ? "text-green-700 dark:text-green-600"
                    : efficiency === "good"
                      ? "text-yellow-700 dark:text-yellow-600"
                      : "text-red-700 dark:text-red-600"
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

interface MobileViewProps {
  userConsumption: number;
  totalConsumption: number;
  userPercentage: number;
  efficiency: string;
  showLoading: boolean;
}

// Ultra-compact single row design
function MobileView({
  userConsumption,
  totalConsumption,
  userPercentage,
  efficiency,
  showLoading,
}: MobileViewProps) {
  return (
    <div className="md:hidden" data-testid="mobile-view">
      <Card className="p-3">
        <div className="space-y-2">
          {/* Main metrics in compact grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              {showLoading ? (
                <div className="bg-muted mx-auto h-7 w-16 animate-pulse rounded"></div>
              ) : (
                <div className="text-lg font-bold">
                  {userConsumption.toFixed(1)}
                </div>
              )}
              <div className="text-muted-foreground text-xs">Your kWh</div>
            </div>
            <div>
              {showLoading ? (
                <div className="bg-muted mx-auto h-7 w-16 animate-pulse rounded"></div>
              ) : (
                <div className="text-lg font-bold">
                  {totalConsumption.toFixed(1)}
                </div>
              )}
              <div className="text-muted-foreground text-xs">Total kWh</div>
            </div>
            <div>
              {showLoading ? (
                <div className="bg-muted mx-auto h-7 w-12 animate-pulse rounded"></div>
              ) : (
                <div
                  className={`text-lg font-bold ${
                    efficiency === "excellent"
                      ? "text-green-700 dark:text-green-600"
                      : efficiency === "good"
                        ? "text-yellow-700 dark:text-yellow-600"
                        : "text-red-700 dark:text-red-600"
                  }`}
                >
                  {userPercentage.toFixed(1)}%
                </div>
              )}
              <div className="text-muted-foreground text-xs">Your share</div>
            </div>
          </div>

          {/* Period info only */}
          {/* <div className="text-muted-foreground border-t pt-2 text-center text-xs">
            <span>
              {timePeriod} •{" "}
              {selectedDeviceAlias === "All"
                ? "All devices"
                : selectedDeviceAlias}
            </span>
          </div> */}
        </div>
      </Card>
    </div>
  );
}

// // Alternative Design 1: Horizontal strip with icons
// function MobileView({
//   userConsumption,
//   totalConsumption,
//   userPercentage,
//   efficiency,
//   showLoading,
// }: ViewProps) {
//   const efficiencyColor =
//     efficiency === "excellent"
//       ? "text-green-700 dark:text-green-600"
//       : efficiency === "good"
//         ? "text-yellow-700 dark:text-yellow-600"
//         : "text-red-700 dark:text-red-600";
//   return (
//     <div className="md:hidden" data-testid="mobile-view">
//       <Card className="p-2">
//         <div className="flex items-center justify-center gap-4">
//           <div
//             className="flex w-[40%] items-center gap-1"
//             title="Your consumption"
//           >
//             <User className="text-chart-1 h-4 w-4" fill="currentColor" />
//             {showLoading ? (
//               <div className="bg-muted h-4 w-16 animate-pulse rounded"></div>
//             ) : (
//               <span className="w-full text-center text-sm font-medium">
//                 {userConsumption.toFixed(1)} kWh
//               </span>
//             )}
//           </div>
//           <div
//             className="flex w-[40%] items-center gap-1"
//             title="Total consumption"
//           >
//             <House className="text-chart-2 h-4 w-4" />
//             {showLoading ? (
//               <div className="bg-muted h-4 w-16 animate-pulse rounded"></div>
//             ) : (
//               <span className="w-full text-center text-sm font-medium">
//                 {totalConsumption.toFixed(1)} kWh
//               </span>
//             )}
//           </div>
//           <div
//             className="flex w-[20%] items-center gap-1"
//             title="Your share of total consumption"
//           >
//             {showLoading ? (
//               <>
//                 <div className="bg-muted h-4 w-8 animate-pulse rounded"></div>
//                 <div className="bg-muted h-4 w-4 animate-pulse rounded"></div>
//               </>
//             ) : (
//               <>
//                 <span className={`text-sm font-medium ${efficiencyColor}`}>
//                   {userPercentage.toFixed(1)}
//                 </span>
//                 <PercentIcon className={`h-4 w-4 ${efficiencyColor}`} />
//               </>
//             )}
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// }
