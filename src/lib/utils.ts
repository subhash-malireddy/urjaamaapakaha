import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/* istanbul ignore next */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/* istanbul ignore next */
function serialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}

// Define the structure of the usage response
interface UsageResponse {
  usage: {
    today_energy: number; // Energy value in watts
  };
}

//TODO:: remove this function once api implemented
// Define the simulateApiCall function
/* istanbul ignore next */
async function simulateApiCall(
  _deviceIp: string,
  isTurnOn: boolean,
  startTime?: string | null,
  date?: string | null,
): Promise<UsageResponse> {
  await new Promise((resolve) => setTimeout(resolve, 200)); // Simulate network delay

  if (isTurnOn) {
    const energyValue = getEnergyValueForDate(date);
    return { usage: { today_energy: energyValue } };
  } else {
    if (!startTime) {
      throw new Error("startTime must be provided for turn-off action");
    }
    // Calculate realistic usage value based on startTime
    const duration = Date.now() - new Date(startTime).getTime();
    const calculatedValue = (duration / (1000 * 60 * 60)) * 10; // Example calculation
    return { usage: { today_energy: calculatedValue } };
  }
}

// Seeded random function
/* istanbul ignore next */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Function to get energy value for a specific date
/* istanbul ignore next */
function getEnergyValueForDate(date?: string | null): number {
  if (!date) {
    throw new Error("date must be provided to get energy value");
  }
  const seed = new Date(date).getTime(); // Use the date as a seed
  return Math.floor(seededRandom(seed) * 100); // Generate a value between 0 and 100
}

/**
 * Normalizes a date to minute precision by setting seconds and milliseconds to 0
 */
// export function normalizeToMinute(date: Date): Date {
//   return new Date(new Date(date).setSeconds(0, 0));
// }

/**
 * Converts a date to UTC timestamp with minute precision
 */
export function toUTCMinutePrecision(date: Date): number {
  return Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  );
}

/**
 * Compares two dates at minute precision in UTC
 * @returns negative if date1 < date2, 0 if equal, positive if date1 > date2
 */
export function compareToMinutePrecision(date1: Date, date2: Date): number {
  return toUTCMinutePrecision(date1) - toUTCMinutePrecision(date2);
}

/**
 * Compares two dates for equality at minute precision
 * @returns true if dates are equal up to the minute
 */
export function areDatesEqualToMinute(date1: Date, date2: Date): boolean {
  return compareToMinutePrecision(date1, date2) === 0;
}

/**
 * Checks if a date is in the future at minute precision
 * @returns true if the date is in the future
 */
export function isDateInFuture(date: Date): boolean {
  const now = new Date();
  return compareToMinutePrecision(date, now) > 0;
}

// Convert Date to timezone-adjusted ISO string
export const dateToLocalISOString = (date: Date): string => {
  return new Date(
    date.getTime() - date.getTimezoneOffset() * 60000,
  ).toISOString();
};

// Slice the ISO string up to minute precision (YYYY-MM-DDTHH:MM)
export const sliceISOStringUptoMinute = (isoString: string): string => {
  return isoString.slice(0, 16);
};

/**
 * Creates a Date object from a datetime-local input string value
 *
 * Note: The browser interprets datetime-local values in the local timezone.
 * This function just creates a standard Date object from the input.
 */
export function parseDateTimeLocalInputClient(dateTimeStr: string): Date {
  if (!dateTimeStr) return new Date();

  const date = new Date(dateTimeStr);
  console.log("🚀 ~ parseDateTimeLocalInputClient ~ date:", date);
  return date;
}

// /**
//  * Converts a datetime-local input value to the correct UTC time,
//  * accounting for the difference between client and server timezones.
//  *
//  * @param {string} dateString - The datetime string from datetime-local input (format: "YYYY-MM-DDThh:mm")
//  * @param {number} clientTimezoneOffset - The client's timezone offset in minutes (from getTimezoneOffset())
//  * @returns {Date} - Date object correctly adjusted for timezone differences
//  */
// export function convertDateTimeLocalToUTC(
//   dateString: string,
//   clientTimezoneOffset: number,
// ) {
//   const serverDate = new Date(dateString);
//   console.log("🚀 ~ serverDate:", serverDate);

//   const serverTimezoneOffset = serverDate.getTimezoneOffset();
//   console.log("🚀 ~ serverTimezoneOffset:", serverTimezoneOffset);
//   console.log("🚀 ~ clientTimezoneOffset:", clientTimezoneOffset);

//   const offsetDifference = serverTimezoneOffset - clientTimezoneOffset;
//   const oneMinute = 60 * 1000;
//   const adjustedDate = new Date(
//     serverDate.getTime() + offsetDifference * oneMinute,
//   );
//   console.log("🚀 ~ adjustedDate:", adjustedDate);
//   console.log("🚀 ~ adjustedDate:tz", adjustedDate.getTimezoneOffset());

//   return adjustedDate;
// }

/**
 * @description Get the local date-time string in YYYY-MM-DDTHH:MM format.
 * Useful for input type="datetime-local"
 * @param date - Date object (default: new Date())
 * @returns Local date-time string in YYYY-MM-DDTHH:MM format
 *
 * @example getDateTimeLocalValue(new Date("2023-01-01")) => "2023-01-01T00:00"
 * */
export const getDateTimeLocalValue = (date: Date | null): string => {
  if (date === null) return "";
  return sliceISOStringUptoMinute(dateToLocalISOString(date));
};

// Helper function to get current time + 1 minute as a Date object
export const getCurrentDatePlusOneMin = (): Date => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1); // Add 1 minute
  return now;
};

// Helper function to get current time + 8 hours as a Date object
export const getCurrentDatePlusEightHours = (): Date => {
  const now = new Date();
  now.setHours(now.getHours() + 8); // Add 8 hours
  return now;
};

// Helper function to check if a date is within 8 hours from now
export const isWithinEightHours = (date: Date): boolean => {
  const eightHoursLater = getCurrentDatePlusEightHours();
  return compareToMinutePrecision(date, eightHoursLater) <= 0;
};

// Helper function to check if a date is within 8 hours from a specified date
export const isWithinEightHoursFromDate = (
  givenDate: Date,
  fromDate: Date,
): boolean => {
  const oneHour = 60 * 60 * 1000;
  const eightHoursLater = new Date(fromDate.getTime() + 8 * oneHour);
  console.log("🚀 ~ givenDate:", givenDate);
  console.log("🚀 ~ givenDate:", givenDate.getTimezoneOffset());
  console.log("🚀 ~ fromDate:", fromDate);
  console.log("🚀 ~ fromDate:", fromDate.getTimezoneOffset());
  console.log("🚀 ~ eightHoursLater:", eightHoursLater);
  return compareToMinutePrecision(givenDate, eightHoursLater) <= 0;
};

/**
 * Constructs a date object from a datetime-local input value and client timezone offset
 *
 * @param datetimeLocalStr - The datetime-local input value (format: "YYYY-MM-DDTHH:MM")
 * @param timezoneOffset - The client's timezone offset in minutes (from getTimezoneOffset())
 * @returns - A Date object representing the exact moment in time
 * @throws - If inputs are invalid
 */
/* istanbul ignore next */
export function convertDateTimeLocalToUTC(
  datetimeLocalStr: string,
  timezoneOffset: number,
) {
  // Validate inputs
  if (!datetimeLocalStr || typeof datetimeLocalStr !== "string") {
    throw new Error("Invalid datetime string: must be a non-empty string");
  }

  if (!datetimeLocalStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
    throw new Error(
      'Invalid datetime format: must be in format "YYYY-MM-DDTHH:MM"',
    );
  }

  // Parse the offset
  if (isNaN(timezoneOffset)) {
    throw new Error("Invalid timezone offset: must be a number");
  }

  // First, create a date object from the local datetime string
  // Note: When we parse this string without a timezone, JS assumes it's in local time
  const localDate = new Date(datetimeLocalStr);

  if (isNaN(localDate.getTime())) {
    throw new Error("Invalid date created from input string");
  }

  // Now we need to adjust for the timezone difference
  // getTimezoneOffset() returns minutes WEST of UTC (opposite of what most people expect)
  // For example, for UTC+10, getTimezoneOffset() returns -600

  // 1. Get the UTC time in milliseconds for the provided local time
  const utcTime =
    localDate.getTime() - localDate.getTimezoneOffset() * 60 * 1000;

  // 2. Apply the client's timezone offset to get their local time
  const clientTime = utcTime + timezoneOffset * 60 * 1000;

  // Create a new date object with the adjusted time
  return new Date(clientTime);
}

//using this sytax for making istanbul ignore next work.
export { cn, serialize, simulateApiCall, type UsageResponse };
