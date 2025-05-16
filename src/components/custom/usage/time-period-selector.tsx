import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TimePeriod =
  // | "previous week"
  // | "previous month"
  // | "previous billing period" // TODO:: this could be a stretch goal
  "current week" | "current month" | "current billing period";

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
        <SelectValue placeholder="Select time period" />
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
