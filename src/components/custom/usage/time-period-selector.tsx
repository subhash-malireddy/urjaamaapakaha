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
  selectedValue = "current week",
}: {
  onSelect: (period: TimePeriod) => void;
  selectedValue: TimePeriod;
}) {
  return (
    <Select
      onValueChange={(value) => onSelect?.(value as TimePeriod)}
      value={selectedValue}
      name="timePeriod"
    >
      <SelectTrigger className="w-[150px] md:w-[200px]">
        <SelectValue placeholder="Select time period">
          {selectedValue}
        </SelectValue>
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectGroup>
          <SelectItem value="current week">Current Week</SelectItem>
          <SelectItem value="current month">Current Month</SelectItem>
          <SelectItem value="current billing period">
            Current Billing Period
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
