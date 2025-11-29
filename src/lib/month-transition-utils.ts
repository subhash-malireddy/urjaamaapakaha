/**
 * Converts a UTC date to Sydney timezone
 * @param utcDate - The UTC date to convert
 * @returns Date object in Sydney timezone
 */
export function toSydneyTime(utcDate: Date): Date {
  return new Date(
    utcDate.toLocaleString("en-US", { timeZone: "Australia/Sydney" }),
  );
}

/**
 * Checks if two dates represent a month transition when converted to Sydney timezone
 * @param startDate - The start date in UTC
 * @param endDate - The end date in UTC
 * @returns True if the dates cross month boundaries in Sydney timezone
 */
export function isMonthTransition(startDate: Date, endDate: Date): boolean {
  const sydneyStartDate = toSydneyTime(startDate);
  const sydneyEndDate = toSydneyTime(endDate);

  const startMonth = sydneyStartDate.getMonth();
  const endMonth = sydneyEndDate.getMonth();

  return startMonth !== endMonth;
}
