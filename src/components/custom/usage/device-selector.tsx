import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type DeviceSelectionList } from "@/lib/zod/usage";

export default function DeviceSelector({
  devices,
  onSelect,
  selectedDeviceValue,
  selectedDeviceAlias,
}: {
  devices: DeviceSelectionList;
  onSelect: (deviceId: string) => void;
  selectedDeviceValue: string;
  selectedDeviceAlias: string;
}) {
  const deviceCount = devices.length;
  const hasDevices = deviceCount > 0;

  return (
    <div className="space-y-1">
      <label
        htmlFor="device-selector"
        className="sr-only text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Device Selection
      </label>
      <Select
        onValueChange={onSelect}
        value={selectedDeviceValue}
        name="deviceId"
        disabled={!hasDevices}
        aria-label="Select device for usage data"
        aria-describedby="device-selector-description"
      >
        <SelectTrigger
          id="device-selector"
          className="w-[150px] md:w-[200px]"
          aria-expanded={false}
          aria-haspopup="listbox"
        >
          <SelectValue
            placeholder={
              hasDevices ? "Select a device" : "No devices available"
            }
            aria-label={
              selectedDeviceAlias
                ? `Selected device: ${selectedDeviceAlias}`
                : "No device selected"
            }
          >
            {selectedDeviceAlias}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          position="popper"
          role="listbox"
          aria-label="Available devices"
        >
          <SelectGroup>
            <SelectItem value="All" aria-label="Show data for all devices">
              All
            </SelectItem>
            {devices.map((device) => (
              <SelectItem
                key={device.id}
                value={device.id}
                aria-label={`Select ${device.alias}`}
              >
                {device.alias}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div
        id="device-selector-description"
        className="sr-only"
        aria-live="polite"
      >
        {hasDevices
          ? `${deviceCount} device${deviceCount === 1 ? "" : "s"} available. Currently ${selectedDeviceValue === "All" ? "showing all devices" : `showing ${selectedDeviceAlias}`}.`
          : "No devices are currently available for selection."}
      </div>
    </div>
  );
}
