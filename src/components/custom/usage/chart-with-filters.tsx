"use client";
import { type DeviceSelectionList } from "@/lib/zod/usage";
import FiltersForm from "./filters-form";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  return (
    <div className="flex w-full flex-col">
      <FiltersForm
        devices={devices}
        selectedDeviceValue={selectedDeviceValue}
        selectedDeviceAlias={selectedDeviceAlias}
        selectedTimePeriod={selectedTimePeriod}
        handleDeviceSelect={handleDeviceSelect}
        handleTimePeriodSelect={handleTimePeriodSelect}
      />
      <div data-testid="chart" className="flex w-full flex-col gap-2">
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
        {/* for now, we will display textual data as per the details in usage-screen-implemenation notepad */}
        {usageData && (
          <div className="flex flex-col gap-2">
            <h3>User vs Total Usage</h3>
            <p>
              {usageData.data?.userConsumption.reduce((acc, curr) => {
                const result = acc + curr.consumption;
                return result;
              }, 0)}
              &nbsp;vs&nbsp;
              {usageData.data?.totalConsumption.reduce(
                (acc, curr) => acc + curr.consumption,
                0,
              )}
            </p>
            <div className="flex flex-col gap-2">
              <h4>User Consumption</h4>
              <p>
                {usageData.data?.userConsumption.map((item) => (
                  <div key={item.date.toISOString()}>
                    <p>
                      {item.date.toLocaleDateString()} - {item.consumption}
                    </p>
                  </div>
                ))}
              </p>
              <h4>Total Consumption</h4>
              <p>
                {usageData.data?.totalConsumption.map((item) => (
                  <div key={item.date.toISOString()}>
                    <p>
                      {item.date.toLocaleDateString()} - {item.consumption}
                    </p>
                  </div>
                ))}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
