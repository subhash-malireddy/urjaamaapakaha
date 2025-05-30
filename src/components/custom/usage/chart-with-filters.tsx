"use client";
import { type DeviceSelectionList } from "@/lib/zod/usage";
import FiltersForm from "./filters-form";
import UsageChart from "./usage-chart";
import UsageSummary from "./usage-summary";
import { useEffect, useState, useTransition } from "react";
import { getUsageDataAction } from "@/lib/actions/usage-actions";
import { getDateRangeForTimePeriod, type TimePeriod } from "@/lib/usage-utils";

export default function ChartWithFilters({
  devices,
}: {
  devices: DeviceSelectionList;
}) {
  const [usageData, setUsageData] =
    useState<Awaited<ReturnType<typeof getUsageDataAction>>>();
  console.log("📜usageData:: ", usageData);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] =
    useState<TimePeriod>("current week");
  const [isPending, startTransition] = useTransition();

  const handleDeviceSelect = (deviceId: string) => {
    if (deviceId === "All") {
      setSelectedDeviceId(null);
    } else {
      setSelectedDeviceId(deviceId);
    }
  };

  const handleTimePeriodSelect = (period: TimePeriod) => {
    setSelectedTimePeriod(period);
  };

  const dateRange = getDateRangeForTimePeriod(selectedTimePeriod);

  const selectedDeviceValue = selectedDeviceId ?? "All";
  const selectedDeviceAlias =
    devices.find((device) => device.id === selectedDeviceId)?.alias || "All";

  useEffect(() => {
    const fetchUsageData = (
      deviceId: string | null,
      timePeriod: TimePeriod,
    ) => {
      startTransition(async () => {
        const result = await getUsageDataAction(
          timePeriod,
          dateRange,
          deviceId || undefined,
        );
        setUsageData(result);
      });
    };
    fetchUsageData(selectedDeviceId, selectedTimePeriod);
  }, [selectedDeviceId, selectedTimePeriod]);

  // Calculate totals for summary
  const totalUserConsumption =
    usageData?.data?.userConsumption.reduce(
      (sum, item) => sum + item.consumption,
      0,
    ) || 0;
  const totalOverallConsumption =
    usageData?.data?.totalConsumption.reduce(
      (sum, item) => sum + item.consumption,
      0,
    ) || 0;

  return (
    <div className="flex w-full flex-col gap-6">
      <FiltersForm
        devices={devices}
        selectedDeviceValue={selectedDeviceValue}
        selectedDeviceAlias={selectedDeviceAlias}
        selectedTimePeriod={selectedTimePeriod}
        handleDeviceSelect={handleDeviceSelect}
        handleTimePeriodSelect={handleTimePeriodSelect}
      />

      <div data-testid="chart" className="flex w-full flex-col gap-6">
        <p className="text-center text-lg">
          Showing usage for&nbsp;
          <em>
            {selectedDeviceAlias === "All"
              ? "All Devices"
              : selectedDeviceAlias}
          </em>
          &nbsp;from&nbsp;
          <em>{dateRange.formatted.start}</em>
          &nbsp;to&nbsp;
          <em>{dateRange.formatted.end}</em>
        </p>

        {/* Summary Cards */}
        {usageData?.data && !isPending && (
          <UsageSummary
            userConsumption={totalUserConsumption}
            totalConsumption={totalOverallConsumption}
            timePeriod={selectedTimePeriod}
          />
        )}

        {/* Chart Component */}
        {usageData?.data && (
          <UsageChart
            data={usageData.data}
            timePeriod={selectedTimePeriod}
            isLoading={isPending}
          />
        )}

        {/* Text-based data display for fallback/debugging */}
        {usageData && (
          <details className="mt-4">
            <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm font-medium">
              Show detailed consumption data
            </summary>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h4 className="font-medium">Your Daily Consumption</h4>
                <div className="grid grid-cols-1 gap-1 text-sm md:grid-cols-2">
                  {usageData.data?.userConsumption.map((item) => (
                    <div
                      key={item.date.toISOString()}
                      className="bg-muted/50 flex justify-between rounded-md p-2"
                    >
                      <span>{item.date.toLocaleDateString()}</span>
                      <span className="font-mono">{item.consumption} kWh</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="font-medium">Total Daily Consumption</h4>
                <div className="grid grid-cols-1 gap-1 text-sm md:grid-cols-2">
                  {usageData.data?.totalConsumption.map((item) => (
                    <div
                      key={item.date.toISOString()}
                      className="bg-muted/50 flex justify-between rounded-md p-2"
                    >
                      <span>{item.date.toLocaleDateString()}</span>
                      <span className="font-mono">{item.consumption} kWh</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </details>
        )}

        {isPending && !usageData && (
          <div className="flex h-[350px] items-center justify-center">
            <div className="text-muted-foreground text-sm">
              Loading chart data...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
