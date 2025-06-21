import { APP_CONFIG } from '../constants';
import { DatabaseSession } from '../types';

type SessionInfo = Pick<DatabaseSession, 'session_id' | 'start_date' | 'end_date'>;

export const formatDayProgress = (currentDay: number): string => {
  const dayNumber = Math.floor(currentDay);
  return `${dayNumber}일차/${APP_CONFIG.SESSION_DURATION_DAYS}일`;
};

export const getStatusIcon = (isClicked: boolean): string => {
  return isClicked ? APP_CONFIG.STATUS_ICONS.CLAIMED : APP_CONFIG.STATUS_ICONS.NOT_CLAIMED;
};

export const formatSessionInfo = (
  session: SessionInfo,
  index: number,
  currentDay: number,
  isClicked: boolean,
): string => {
  const dayText = formatDayProgress(currentDay);
  const statusText = getStatusIcon(isClicked);
  const sessionNumber = index + 1;

  return `• #${sessionNumber} (${session.start_date}~${session.end_date}) — ${dayText} — 수령: ${statusText}`;
};
