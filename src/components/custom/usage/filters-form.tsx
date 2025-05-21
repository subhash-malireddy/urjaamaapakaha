"use client";

import { type DeviceSelectionList } from "@/lib/zod/usage";
import TimePeriodSelector from "./time-period-selector";
import DeviceSelector from "./device-selector";
import { Label } from "@/components/ui/label";
import { type TimePeriod } from "@/lib/usage-utils";
interface FiltersFormProps {
  devices: DeviceSelectionList;
  selectedDeviceValue: string;
  selectedDeviceAlias: string;
  selectedTimePeriod: TimePeriod;
  handleDeviceSelect: (deviceId: string) => void;
  handleTimePeriodSelect: (timePeriod: TimePeriod) => void;
}

export default function FiltersForm({
  devices,
  selectedDeviceValue,
  selectedDeviceAlias,
  selectedTimePeriod,
  handleDeviceSelect,
  handleTimePeriodSelect,
}: FiltersFormProps) {
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
    </div>
  );
}
