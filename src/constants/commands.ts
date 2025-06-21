export const COMMANDS = {
  HELP: 'help',
  START_SESSION: 'start_session',
  STATUS: 'status',
  CANCEL_SESSION: 'cancel_session',
} as const;

export const CALLBACK_ACTIONS = {
  CONFIRM: 'CONFIRM',
  CANCEL: 'CANCEL',
} as const;

export const CALLBACK_PREFIXES = {
  MORNING_TIME: 'MORN_',
  EVENING_TIME: 'EVE_',
} as const;
