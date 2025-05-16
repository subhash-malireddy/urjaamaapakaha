import { type DeviceSelectionList } from "@/lib/zod/usage";
import FiltersForm from "./filters-form";
export default function ChartWithFilters({
  devices,
}: {
  devices: DeviceSelectionList;
}) {
  return (
    <div className="flex w-full flex-col">
      <FiltersForm devices={devices} />
      <div data-testid="chart" className="flex w-full">
        {/* for now, we will display textual data as per the details in usage-screen-implemenation notepad */}
      </div>
    </div>
  );
}
