import { getPlatformCalendarEvents } from "@platformSpecific/sidebar/utils/officeMisc";

/*
 * Function to get all calendar events for a user between two dates/times
 *
 * It uses an EWS request if we have permissions.
 * If not it throws an error
 *
 * start and end must be in ISO format
 * */
export const getCalendarEvents = async (start: string, end: string) => {
  return await getPlatformCalendarEvents(start, end);
};

/*
 * Function to check if a user is available between two dates/times
 *
 * start and end must be in ISO format
 * Returns an object with the following properties:
 *  - available: true if the user is available, false if not, null if there was an error
 *  - conflict: the subject of the event that conflicts with the requested time, null if there is no conflict
 */
export const isUserAvailable = async (start: string, end: string) => {
  try {
    // We add one second to the start time to avoid getting false results with events ending at the same time
    let startAdjusted = new Date(start);
    startAdjusted.setSeconds(startAdjusted.getSeconds() + 1);

    // We remove one second from the end time to avoid getting false results with events starting at the same time
    let endAdjusted = new Date(end);
    endAdjusted.setSeconds(endAdjusted.getSeconds() - 1);

    const events = (await getCalendarEvents(startAdjusted.toISOString(), endAdjusted.toISOString())) as any;
    // check if there's no event or if all the events are free (no busy events)
    const available = events.length === 0 || events.every((event: any) => event.isFreeSlot);
    const conflict = !available ? events[0]?.subject ?? null : null;
    return {
      available,
      conflict,
    };
  } catch (e) {
    console.log("Error checking availability", e);
    return { available: null, conflict: null };
  }
};

export const WINDOWS_TIMEZONE_MAP: { [key: string]: string } = {
  "AUS Central Standard Time": "Australia/Darwin",
  "AUS Eastern Standard Time": "Australia/Sydney",
  "Afghanistan Standard Time": "Asia/Kabul",
  "Alaskan Standard Time": "America/Anchorage",
  "Arab Standard Time": "Asia/Riyadh",
  "Arabian Standard Time": "Asia/Dubai",
  "Arabic Standard Time": "Asia/Baghdad",
  "Argentina Standard Time": "America/Buenos_Aires",
  "Atlantic Standard Time": "America/Halifax",
  "Azerbaijan Standard Time": "Asia/Baku",
  "Azores Standard Time": "Atlantic/Azores",
  "Bahia Standard Time": "America/Bahia",
  "Bangladesh Standard Time": "Asia/Dhaka",
  "Canada Central Standard Time": "America/Regina",
  "Cape Verde Standard Time": "Atlantic/Cape_Verde",
  "Caucasus Standard Time": "Asia/Yerevan",
  "Cen. Australia Standard Time": "Australia/Adelaide",
  "Central America Standard Time": "America/Guatemala",
  "Central Asia Standard Time": "Asia/Almaty",
  "Central Brazilian Standard Time": "America/Cuiaba",
  "Central Europe Standard Time": "Europe/Budapest",
  "Central European Standard Time": "Europe/Warsaw",
  "Central Pacific Standard Time": "Pacific/Guadalcanal",
  "Central Standard Time": "America/Chicago",
  "Central Standard Time (Mexico)": "America/Mexico_City",
  "China Standard Time": "Asia/Shanghai",
  "Dateline Standard Time": "Etc/GMT+12",
  "E. Africa Standard Time": "Africa/Nairobi",
  "E. Australia Standard Time": "Australia/Brisbane",
  "E. Europe Standard Time": "Asia/Nicosia",
  "E. South America Standard Time": "America/Sao_Paulo",
  "Eastern Standard Time": "America/New_York",
  "Egypt Standard Time": "Africa/Cairo",
  "Ekaterinburg Standard Time": "Asia/Yekaterinburg",
  "FLE Standard Time": "Europe/Kiev",
  "Fiji Standard Time": "Pacific/Fiji",
  "GMT Standard Time": "Europe/London",
  "GTB Standard Time": "Europe/Bucharest",
  "Georgian Standard Time": "Asia/Tbilisi",
  "Greenland Standard Time": "America/Godthab",
  "Greenwich Standard Time": "Atlantic/Reykjavik",
  "Hawaiian Standard Time": "Pacific/Honolulu",
  "India Standard Time": "Asia/Calcutta",
  "Iran Standard Time": "Asia/Tehran",
  "Israel Standard Time": "Asia/Jerusalem",
  "Jordan Standard Time": "Asia/Amman",
  "Kaliningrad Standard Time": "Europe/Kaliningrad",
  "Korea Standard Time": "Asia/Seoul",
  "Magadan Standard Time": "Asia/Magadan",
  "Mauritius Standard Time": "Indian/Mauritius",
  "Middle East Standard Time": "Asia/Beirut",
  "Montevideo Standard Time": "America/Montevideo",
  "Morocco Standard Time": "Africa/Casablanca",
  "Mountain Standard Time": "America/Denver",
  "Mountain Standard Time (Mexico)": "America/Chihuahua",
  "Myanmar Standard Time": "Asia/Rangoon",
  "N. Central Asia Standard Time": "Asia/Novosibirsk",
  "Namibia Standard Time": "Africa/Windhoek",
  "Nepal Standard Time": "Asia/Katmandu",
  "New Zealand Standard Time": "Pacific/Auckland",
  "Newfoundland Standard Time": "America/St_Johns",
  "North Asia East Standard Time": "Asia/Irkutsk",
  "North Asia Standard Time": "Asia/Krasnoyarsk",
  "Pacific SA Standard Time": "America/Santiago",
  "Pacific Standard Time": "America/Los_Angeles",
  "Pacific Standard Time (Mexico)": "America/Santa_Isabel",
  "Pakistan Standard Time": "Asia/Karachi",
  "Paraguay Standard Time": "America/Asuncion",
  "Romance Standard Time": "Europe/Paris",
  "Russian Standard Time": "Europe/Moscow",
  "SA Eastern Standard Time": "America/Cayenne",
  "SA Pacific Standard Time": "America/Bogota",
  "SA Western Standard Time": "America/La_Paz",
  "SE Asia Standard Time": "Asia/Bangkok",
  "Samoa Standard Time": "Pacific/Apia",
  "Singapore Standard Time": "Asia/Singapore",
  "South Africa Standard Time": "Africa/Johannesburg",
  "Sri Lanka Standard Time": "Asia/Colombo",
  "Syria Standard Time": "Asia/Damascus",
  "Taipei Standard Time": "Asia/Taipei",
  "Tasmania Standard Time": "Australia/Hobart",
  "Tokyo Standard Time": "Asia/Tokyo",
  "Tonga Standard Time": "Pacific/Tongatapu",
  "Turkey Standard Time": "Europe/Istanbul",
  "US Eastern Standard Time": "America/Indianapolis",
  "US Mountain Standard Time": "America/Phoenix",
  UTC: "Etc/GMT",
  "UTC+12": "Etc/GMT-12",
  "UTC-02": "Etc/GMT+2",
  "UTC-11": "Etc/GMT+11",
  "Ulaanbaatar Standard Time": "Asia/Ulaanbaatar",
  "Venezuela Standard Time": "America/Caracas",
  "Vladivostok Standard Time": "Asia/Vladivostok",
  "W. Australia Standard Time": "Australia/Perth",
  "W. Central Africa Standard Time": "Africa/Lagos",
  "W. Europe Standard Time": "Europe/Berlin",
  "West Asia Standard Time": "Asia/Tashkent",
  "West Pacific Standard Time": "Pacific/Port_Moresby",
  "Yakutsk Standard Time": "Asia/Yakutsk",
  "Madrid Standard Time": "Europe/Madrid",
};
