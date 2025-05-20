"use client";

import { type DeviceSelectionList } from "@/lib/zod/usage";
import TimePeriodSelector from "./time-period-selector";
import DeviceSelector from "./device-selector";
import { Label } from "@/components/ui/label";
import { useEffect, useState, useTransition } from "react";
import { getDateRangeForTimePeriod, type TimePeriod } from "@/lib/usage-utils";
import { getUsageDataAction } from "@/lib/actions/usage-actions";

interface FiltersFormProps {
  devices: DeviceSelectionList;
  onDataFetched: (data: Awaited<ReturnType<typeof getUsageDataAction>>) => void;
}

export default function FiltersForm({
  devices,
  onDataFetched,
}: FiltersFormProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] =
    useState<TimePeriod>("current week");
  // const [usageData, setUsageData] =
  //   useState<Awaited<ReturnType<typeof getUsageDataAction>>>();

  // console.log("📜usageData:: ", usageData);
  const handleDeviceSelect = (deviceId: string) => {
    if (deviceId === "All") {
      setSelectedDeviceId(null);
    } else {
      setSelectedDeviceId(deviceId);
    }
    // fetchUsageData(deviceId === "All" ? null : deviceId, selectedTimePeriod);
  };

  const handleTimePeriodSelect = (period: TimePeriod) => {
    setSelectedTimePeriod(period);
    // fetchUsageData(selectedDeviceId, period);
  };

  const dateRange = getDateRangeForTimePeriod(selectedTimePeriod);

  const selectedDeviceValue = selectedDeviceId ?? "All";
  const selectedDeviceAlias =
    devices.find((device) => device.id === selectedDeviceId)?.alias || "All";

  useEffect(() => {
    console.log("initializing usage data");
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
        onDataFetched(result);
      });
    };
    fetchUsageData(selectedDeviceId, selectedTimePeriod);
  }, [selectedDeviceId, selectedTimePeriod]);

  return (
    <div data-testid="filters-form" className="flex w-full flex-col gap-2">
      <form className="flex w-full justify-between">
        <div className="flex flex-col gap-2">
          <Label htmlFor="device-selector" className="text-lg">
            Device
          </Label>
          <DeviceSelector
            devices={devices}
            onSelect={handleDeviceSelect}
            selectedDeviceValue={selectedDeviceValue}
            selectedDeviceAlias={selectedDeviceAlias}
          />
        </div>
        <div className="flex flex-col justify-around gap-2">
          <Label htmlFor="time-period-selector" className="text-lg">
            Time Period
          </Label>
          <TimePeriodSelector
            onSelect={handleTimePeriodSelect}
            selectedValue={selectedTimePeriod}
          />
        </div>
      </form>
      <p className="text-center text-lg">
        Showing usage for&nbsp;
        <em>
          {selectedDeviceAlias === "All" ? "All Devices" : selectedDeviceAlias}
        </em>
        &nbsp;from&nbsp;
        <em>{dateRange.formatted.start}</em>
        &nbsp;to&nbsp;
        <em>{dateRange.formatted.end}</em>
      </p>
    </div>
  );
}
