import { DateTime } from 'luxon';

export const toUTC = (date: string, time: string, tz: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD`);
  }

  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new Error(`Invalid time format: ${time}. Expected HH:MM`);
  }

  if (!DateTime.local().setZone(tz).isValid) {
    throw new Error(`Invalid timezone: ${tz}`);
  }

  const dt = DateTime.fromISO(`${date}T${time}`, { zone: tz });
  if (!dt.isValid) {
    throw new Error(`Invalid date/time: ${date}T${time} in zone ${tz}`);
  }

  return dt.toUTC().toISO()!;
};
