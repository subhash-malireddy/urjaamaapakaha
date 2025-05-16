"use client";

import { DeviceSelectionList } from "@/lib/zod/usage";
import TimePeriodSelector from "./time-period-selector";
import DeviceSelector from "./device-selector";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function FiltersForm({
  devices,
}: {
  devices: DeviceSelectionList;
}) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const handleDeviceSelect = (deviceId: string) => {
    console.log("deviceId:: ", deviceId);
    if (deviceId === "All") {
      setSelectedDeviceId(null);
    } else {
      setSelectedDeviceId(deviceId);
    }
  };

  const selectedDeviceValue = selectedDeviceId || "All";
  console.log("selectedDeviceValue:: ", selectedDeviceValue);

  const selectedDeviceAlias =
    devices.find((device) => device.id === selectedDeviceId)?.alias || "All";
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
          />
        </div>
        <div className="flex flex-col justify-around gap-2">
          <Label htmlFor="time-period-selector" className="text-lg">
            Time Period
          </Label>
          <TimePeriodSelector />
        </div>
      </form>
      <p className="text-center text-lg">
        Showing usage for <em>{selectedDeviceAlias}</em>
      </p>
    </div>
  );
}
