import { DateTime } from 'luxon';
import { VALIDATION_ERRORS } from '../constants';

const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_FORMAT_REGEX = /^\d{2}:\d{2}$/;

const validateDateFormat = (date: string): void => {
  if (!DATE_FORMAT_REGEX.test(date)) {
    throw new Error(VALIDATION_ERRORS.INVALID_DATE_FORMAT(date));
  }
};

const validateTimeFormat = (time: string): void => {
  if (!TIME_FORMAT_REGEX.test(time)) {
    throw new Error(VALIDATION_ERRORS.INVALID_TIME_FORMAT(time));
  }
};

const validateTimezone = (timezone: string): void => {
  if (!DateTime.local().setZone(timezone).isValid) {
    throw new Error(VALIDATION_ERRORS.INVALID_TIMEZONE(timezone));
  }
};

export const toUTC = (date: string, time: string, timezone: string): string => {
  validateDateFormat(date);
  validateTimeFormat(time);
  validateTimezone(timezone);

  const dateTime = DateTime.fromISO(`${date}T${time}`, { zone: timezone });

  if (!dateTime.isValid) {
    throw new Error(VALIDATION_ERRORS.INVALID_DATETIME(date, time, timezone));
  }

  const isoString = dateTime.toUTC().toISO();

  if (!isoString) {
    throw new Error(VALIDATION_ERRORS.INVALID_DATETIME(date, time, timezone));
  }

  return isoString;
};
