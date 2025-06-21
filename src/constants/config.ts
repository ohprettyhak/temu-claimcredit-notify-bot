export const APP_CONFIG = {
  DEFAULT_TIMEZONE: 'Asia/Seoul',
  SESSION_DURATION_DAYS: 7,
  NOTIFICATION_TYPES: {
    MORNING: 'morning',
    EVENING: 'evening',
  },
  STATUS_ICONS: {
    CLAIMED: '✅',
    NOT_CLAIMED: '❌',
  },
  URLS: {
    TEMU: 'https://www.temu.com/s/',
  },
} as const;
