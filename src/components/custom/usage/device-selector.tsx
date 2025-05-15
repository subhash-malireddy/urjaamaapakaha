import { type DeviceSelectionList } from "@/lib/zod/usage";

export default function DeviceSelector({
  devices,
}: {
  devices: DeviceSelectionList;
}) {
  return <div>{JSON.stringify(devices)}</div>;
}
