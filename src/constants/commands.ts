export const COMMANDS = {
  HELP: 'help',
  START_SESSION: 'start_session',
  STATUS: 'status',
  CANCEL_SESSION: 'cancel_session',
} as const;

export const CALLBACK_ACTIONS = {
  CONFIRM: 'CONFIRM',
  CANCEL: 'CANCEL',
  TODAY_CLAIMED: 'TODAY_CLAIMED',
  TODAY_NOT_CLAIMED: 'TODAY_NOT_CLAIMED',
} as const;

export const CALLBACK_PREFIXES = {
  MORNING_TIME: 'MORN_',
  EVENING_TIME: 'EVE_',
  CLAIM: 'claim_',
  DELETE_SESSION: 'delete_session_',
} as const;

export const SCENE_IDS = {
  START_SESSION: 'start_session',
} as const;

export const VALIDATION_PATTERNS = {
  COMMAND: /^\/\w+/,
  TIME_FORMAT: /^([01]?\d|2[0-3]):([0-5]\d)$/,
  DATE_FORMAT: /^\d{4}-\d{2}-\d{2}$/,
} as const;
