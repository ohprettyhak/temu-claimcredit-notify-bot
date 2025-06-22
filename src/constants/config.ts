import { NotificationType } from '../types';

export const NOTIFICATION_TYPES: Record<'MORNING' | 'EVENING', NotificationType> = {
  MORNING: 'morning',
  EVENING: 'evening',
} as const;

export const APP_CONFIG = {
  DEFAULT_TIMEZONE: 'Asia/Seoul',
  SESSION_DURATION_DAYS: 7,
  NOTIFICATION_TYPES,
  URLS: {
    TEMU: 'https://www.temu.com/s/',
  },
} as const;
