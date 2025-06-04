import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type TimePeriod } from "@/lib/usage-utils";

export default function TimePeriodSelector({
  onSelect,
  selectedValue,
}: {
  onSelect: (period: TimePeriod) => void;
  selectedValue: TimePeriod;
}) {
  return (
    <Select
      onValueChange={(value) => onSelect(value as TimePeriod)}
      value={selectedValue}
      name="timePeriod"
    >
      <SelectTrigger
        className="w-[150px] md:w-[200px]"
        aria-label="Select time period for usage data"
        aria-describedby="time-period-description"
      >
        <SelectValue placeholder="Select time period">
          {selectedValue}
        </SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" aria-label="Time period options">
        <SelectGroup>
          <SelectItem
            value="current week"
            aria-description="View usage data for the current week"
          >
            Current Week
          </SelectItem>
          <SelectItem
            value="current month"
            aria-description="View usage data for the current month"
          >
            Current Month
          </SelectItem>
          <SelectItem
            value="current billing period"
            aria-description="View usage data for the current billing period"
          >
            Current Billing Period
          </SelectItem>
        </SelectGroup>
      </SelectContent>
      <span id="time-period-description" className="sr-only">
        Choose a time period to filter your usage statistics
      </span>
    </Select>
  );
}
