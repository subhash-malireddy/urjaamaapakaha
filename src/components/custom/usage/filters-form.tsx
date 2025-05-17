"use client";

import { type DeviceSelectionList } from "@/lib/zod/usage";
import TimePeriodSelector from "./time-period-selector";
import DeviceSelector from "./device-selector";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { getDateRangeForTimePeriod, type TimePeriod } from "@/lib/usage-utils";

export default function FiltersForm({
  devices,
}: {
  devices: DeviceSelectionList;
}) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] =
    useState<TimePeriod>("current week");

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

  const selectedDeviceValue = selectedDeviceId || "All";

  const selectedDeviceAlias =
    devices.find((device) => device.id === selectedDeviceId)?.alias || "All";

  const dateRange = getDateRangeForTimePeriod(selectedTimePeriod);

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
