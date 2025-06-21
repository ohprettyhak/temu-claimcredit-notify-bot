import { APP_CONFIG } from '../constants';
import { DatabaseSession } from '../types';

const FORMAT_CONSTANTS = {
  DAY_SUFFIX: '일차',
  DAY_SEPARATOR: '/',
  DAY_TOTAL_SUFFIX: '일',
  SESSION_PREFIX: '• #',
  SESSION_DATE_SEPARATOR: '~',
  SESSION_STATUS_SEPARATOR: ' — ',
  SESSION_CLAIMED_TEXT: '수령:',
} as const;

type SessionInfo = Pick<DatabaseSession, 'session_id' | 'start_date' | 'end_date'>;

const formatDayProgress = (dayNumber: number): string => {
  return `${dayNumber}${FORMAT_CONSTANTS.DAY_SUFFIX}${FORMAT_CONSTANTS.DAY_SEPARATOR}${APP_CONFIG.SESSION_DURATION_DAYS}${FORMAT_CONSTANTS.DAY_TOTAL_SUFFIX}`;
};

const formatStatusText = (isClicked: boolean): string => {
  return isClicked ? APP_CONFIG.STATUS_ICONS.CLAIMED : APP_CONFIG.STATUS_ICONS.NOT_CLAIMED;
};

export const formatSessionInfo = (
  session: SessionInfo,
  sessionNumber: number,
  currentDay: number,
  isClicked: boolean,
): string => {
  const dayText = formatDayProgress(currentDay);
  const statusText = formatStatusText(isClicked);

  return `${FORMAT_CONSTANTS.SESSION_PREFIX}${sessionNumber} (${session.start_date}${FORMAT_CONSTANTS.SESSION_DATE_SEPARATOR}${session.end_date})${FORMAT_CONSTANTS.SESSION_STATUS_SEPARATOR}${dayText}${FORMAT_CONSTANTS.SESSION_STATUS_SEPARATOR}${FORMAT_CONSTANTS.SESSION_CLAIMED_TEXT} ${statusText}`;
};
