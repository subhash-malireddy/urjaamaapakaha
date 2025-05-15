import { DeviceSelectionList } from "@/lib/zod/usage";
import TimePeriodSelector from "./time-period-selector";
import DeviceSelector from "./device-selector";

export default function FiltersForm({
  devices,
}: {
  devices: DeviceSelectionList;
}) {
  return (
    <div data-testid="filters" className="flex w-full justify-around">
      <form>
        <DeviceSelector devices={devices} />
        <TimePeriodSelector />
      </form>
    </div>
  );
}
