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
  return (
    <Select
      onValueChange={onSelect}
      value={selectedDeviceValue}
      name="deviceId"
    >
      <SelectTrigger className="w-[150px] md:w-[200px]">
        <SelectValue placeholder="Select a device">
          {selectedDeviceAlias}
        </SelectValue>
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectGroup>
          <SelectItem value="All">All</SelectItem>
          {devices.map((device) => (
            <SelectItem key={device.id} value={device.id}>
              {device.alias}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
