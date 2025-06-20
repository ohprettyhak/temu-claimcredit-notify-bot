export const COMMANDS = {
  START: 'start',
  HELP: 'help',
  START_SESSION: 'start_session',
  STATUS: 'status',
  CANCEL_SESSION: 'cancel_session',
} as const;

export const CALLBACK_ACTIONS = {
  CLAIM: 'CLAIM',
  CANCEL: 'CANCEL',
  CONFIRM: 'CONFIRM',
  TZ_OTHER: 'TZ_OTHER',
} as const;

export const CALLBACK_PREFIXES = {
  TIMEZONE: 'TZ_',
  MORNING_TIME: 'MORN_',
  EVENING_TIME: 'EVE_',
} as const;
