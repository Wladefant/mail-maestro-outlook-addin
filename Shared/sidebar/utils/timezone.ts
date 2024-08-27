import { WINDOWS_TIMEZONE_MAP } from "./calendar";
import moment from "moment-timezone";
/**
 * Returns a list of timezones that match the UTC offset of the given datetime.
 *
 * @param datetime The datetime string in ISO format, e.g., "2024-05-09T13:30:00+02:00".
 * @param currentTimeZone Current timezone of the user
 * @returns first matching timezone of specificTimeZones array if it matches the UTC offset of the given datetime or
 * the first timezone matching the UTC offset at that given datetime.
 */
export function getTimezoneFromDatetime(datetime: string, specificTimeZones: string[]): string {
  const parsedDatetime = moment.parseZone(datetime);

  const datetimeOffset = parsedDatetime.utcOffset();

  const matchingTimezones = moment.tz.names().filter((timezone: any) => {
    const offset = moment.tz(datetime, timezone).utcOffset();
    return offset === datetimeOffset;
  });

  if (specificTimeZones.length > 0) {
    for (const tz of matchingTimezones) {
      if (specificTimeZones.includes(tz)) {
        return tz;
      }
    }
  }

  // Find the first matching Windows timezone identifier
  for (const tz of matchingTimezones) {
    for (const [_, tzValue] of Object.entries(WINDOWS_TIMEZONE_MAP)) {
      if (tzValue === tz) {
        return tzValue;
      }
    }
  }

  return "";
}

export function convertDatetimeToTimezone(datetime: string, timezone: string): string {
  const momentDatetime = moment(datetime);

  const convertedDatetime = momentDatetime.tz(timezone);
  const offsetMinutes = convertedDatetime?.utcOffset();
  const offsetHours = Math.floor(offsetMinutes / 60);
  const offsetRemainderMinutes = offsetMinutes % 60;
  //Get formatted offset like "+02:00" or "+08:00"
  const formattedOffset = `${offsetHours >= 0 ? "+" : "-"}${Math.abs(offsetHours).toString().padStart(2, "0")}:${Math.abs(offsetRemainderMinutes).toString().padStart(2, "0")}`;

  // Replace the offset in the datetime string with the formatted offset
  const newDateTimeString = datetime.replace(/(\+|-)\d{2}:\d{2}$/, formattedOffset);

  return newDateTimeString || "";
}

export function formatDateTimeToDisplayOnTimezone(datetime: string, timezone: string): string {
  const momentDatetime = moment(datetime).tz(timezone);
  return momentDatetime ? momentDatetime.format("ddd, MMM D, YYYY h:mm A") : "";
}
