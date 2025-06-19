"use client";
import { type DeviceSelectionList } from "@/lib/zod/usage";
import FiltersForm from "./filters-form";
import UsageChart from "./usage-chart";
import UsageSummary from "./usage-summary";
import { useEffect, useMemo, useState, useTransition } from "react";
import { getUsageDataAction } from "@/lib/actions/usage-actions";
import { getDateRangeForTimePeriod, type TimePeriod } from "@/lib/usage-utils";

export default function ChartWithFilters({
  devices,
}: {
  devices: DeviceSelectionList;
}) {
  //* usageData is null during the initial render
  const [usageData, setUsageData] = useState<Awaited<
    ReturnType<typeof getUsageDataAction>
  > | null>(null);

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

  const dateRange = useMemo(
    () => getDateRangeForTimePeriod(selectedTimePeriod),
    [selectedTimePeriod],
  );

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
  }, [selectedDeviceId, selectedTimePeriod, dateRange]);

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

      <div className="flex w-full flex-col gap-6">
        <div className="text-muted-foreground text-center text-base leading-relaxed">
          Usage data for&nbsp;
          <span className="text-foreground font-medium">
            {selectedDeviceAlias === "All"
              ? "All Devices"
              : selectedDeviceAlias}
          </span>
          &nbsp;from&nbsp;
          <span className="text-foreground font-medium">
            {dateRange.formatted.start}
          </span>
          &nbsp;to&nbsp;
          <span className="text-foreground font-medium">
            {dateRange.formatted.end}
          </span>
        </div>

        {/* Summary Cards */}
        <UsageSummary
          userConsumption={totalUserConsumption}
          totalConsumption={totalOverallConsumption}
          timePeriod={selectedTimePeriod}
          isFetchingData={isPending}
          isDataAvailable={usageData !== null}
          selectedDeviceAlias={selectedDeviceAlias}
        />

        {/* Chart Component */}

        <UsageChart
          isDataAvailable={usageData !== null}
          data={usageData?.data}
          timePeriod={selectedTimePeriod}
          isFetchingData={isPending}
          totalUserConsumption={totalUserConsumption}
          totalOverallConsumption={totalOverallConsumption}
        />

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
      </div>
    </div>
  );
}
