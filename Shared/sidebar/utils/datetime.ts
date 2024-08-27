import { DateTime } from "luxon";
import * as momentTz from "moment-timezone";
import moment from "moment";

export function compareDates(date1: string, date2: string, order: "asc" | "desc"): number {
  const dateA = new Date(date1);
  const dateB = new Date(date2);

  if (order === "asc") {
    return dateA.getTime() - dateB.getTime();
  } else if (order === "desc") {
    return dateB.getTime() - dateA.getTime();
  } else {
    return 0;
  }
}

export function getISODateString(date: string, time: string): string {
  const possibleDateFormats = ["dd/MM/yyyy", "MM/dd/yyyy", "dd-MM-yyyy", "MM-dd-yyyy"];

  let parsedDate: DateTime | null = null;
  for (const formatString of possibleDateFormats) {
    parsedDate = DateTime.fromFormat(date, formatString);
    if (parsedDate.isValid) {
      break;
    }
  }

  // If parsedDate is still invalid, set it to two months ago from current time
  if (!parsedDate?.isValid) {
    parsedDate = DateTime.now().minus({ months: 2 });
  }

  let [hours, minutes, seconds] = [0, 0, 0]; // Default to midnight
  const timeParts = time.split(":").map(Number);
  if (
    timeParts.length === 3 &&
    !timeParts.some(isNaN) &&
    timeParts[0] >= 0 &&
    timeParts[0] < 24 &&
    timeParts[1] >= 0 &&
    timeParts[1] < 60 &&
    timeParts[2] >= 0 &&
    timeParts[2] < 60
  ) {
    [hours, minutes, seconds] = timeParts;
  } else {
    // If time is invalid, set it to midnight
    [hours, minutes, seconds] = [0, 0, 0];
  }

  parsedDate = parsedDate.set({
    hour: hours,
    minute: minutes,
    second: seconds,
  });

  return parsedDate.toISO() as string;
}

export function formatTimezoneAbbreviation(timezone: string): string {
  const timezoneAbbreviation = momentTz.tz(timezone).zoneAbbr();
  if (timezoneAbbreviation.startsWith("+") || timezoneAbbreviation.startsWith("-")) {
    // Convert the timezone offset to a number and back to a string to remove any leading zeros.
    const offset = parseInt(timezoneAbbreviation, 10).toString();
    // Construct the new timezone abbreviation with "UTC" prefix.
    const sign = timezoneAbbreviation.startsWith("+") ? "UTC+" : "UTC-";
    return sign + offset;
  } else {
    return timezoneAbbreviation;
  }
}

export function checkIfTokenIsExpired(expiry: number): boolean {
  return expiry - moment().unix() < 20;
}

export function daysUntil(targetDate: string): number {
  if (!targetDate) {
    return 0;
  }

  const target = new Date(targetDate);

  const now = new Date();

  const diffTime = target.getTime() - now.getTime();

  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays === -0 ? 0 : diffDays;
}

export function getDayOfWeek(dateStr: string): string {
  if (!dateStr) {
    return "";
  }

  const date = new Date(dateStr);

  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const dayOfWeek = date.getUTCDay();

  return weekdays[dayOfWeek];
}
