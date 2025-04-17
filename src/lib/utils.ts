//istanbul ignore file
//TODO:: add tests for this file

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function serialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}

//TODO:: remove this function once api implemented

// Define the structure of the usage response
export interface UsageResponse {
  usage: {
    today_energy: number; // Energy value in watts
  };
}

// Define the simulateApiCall function
export async function simulateApiCall(
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
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Function to get energy value for a specific date
function getEnergyValueForDate(date?: string | null): number {
  if (!date) {
    throw new Error("date must be provided to get energy value");
  }
  const seed = new Date(date).getTime(); // Use the date as a seed
  return Math.floor(seededRandom(seed) * 100); // Generate a value between 0 and 100
}

// Helper function to get current time + 1 minute in HH:MM format
export const getCurrentTimePlusOneMin = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1); // Add 1 minute
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

//todo:: revisit this function
// Helper function to validate if time is in the future
export const isTimeInFuture = (timeString: string) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const now = new Date();
  const estimatedTime = new Date();
  estimatedTime.setHours(hours);
  estimatedTime.setMinutes(minutes);
  estimatedTime.setSeconds(0); // Reset seconds for accurate comparison

  return estimatedTime > now;
};

/**
 * Normalizes a date to minute precision by setting seconds and milliseconds to 0
 */
export function normalizeToMinute(date: Date): Date {
  return new Date(new Date(date).setSeconds(0, 0));
}

/**
 * Compares two dates for equality at minute precision
 * @returns true if dates are equal up to the minute
 */
export function areDatesEqualToMinute(date1: Date, date2: Date): boolean {
  const normalized1 = normalizeToMinute(date1);
  const normalized2 = normalizeToMinute(date2);
  return normalized1.getTime() === normalized2.getTime();
}

/**
 * Checks if a date is in the future at minute precision
 * @returns true if the date is in the future
 */
export function isDateInFuture(date: Date): boolean {
  const normalized = normalizeToMinute(date);
  const normalizedNow = normalizeToMinute(new Date());
  return normalized.getTime() > normalizedNow.getTime();
}

// Convert Date to timezone-adjusted ISO string
const dateToLocalISOString = (date: Date = new Date()): string => {
  return new Date(
    date.getTime() - date.getTimezoneOffset() * 60000,
  ).toISOString();
};

// Slice the ISO string up to minute precision (YYYY-MM-DDTHH:MM)
const sliceISOStringUptoMinute = (isoString: string): string => {
  return isoString.slice(0, 16);
};

/**
 * @description Get the local date-time string in YYYY-MM-DDTHH:MM format.
 * Useful for input type="datetime-local"
 * @param date - Date object (default: new Date())
 * @returns Local date-time string in YYYY-MM-DDTHH:MM format
 *
 * @example getDateTimeLocalValue() => "2023-01-01T00:00"
 * */
export const getDateTimeLocalValue = (
  date: Date | null = new Date(),
): string => {
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
  const normalizedDate = normalizeToMinute(date);
  const normalizedEightHoursLater = normalizeToMinute(
    getCurrentDatePlusEightHours(),
  );
  return normalizedDate.getTime() <= normalizedEightHoursLater.getTime();
};
