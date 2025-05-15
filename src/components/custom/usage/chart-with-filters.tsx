import DeviceSelector from "./device-selector";
import TimePeriodSelector from "./time-period-selector";

export default function ChartWithFilters() {
  return (
    <div className="flex w-full flex-col">
      <div data-testid="filters" className="flex w-full justify-around">
        <DeviceSelector />
        <TimePeriodSelector />
      </div>
      <div data-testid="chart" className="flex w-full">
        {/* for now, we will display textual data as per the details in usage-screen-implemenation notepad */}
      </div>
    </div>
  );
}
