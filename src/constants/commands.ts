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

export const ACTION_NAMES = {
  CLAIM_NOTIFICATION: '수령 완료',
  CANCEL_SESSION: '세션 취소',
  CLAIM_CREDIT: '크레딧 수령',
  DELETE_SESSION: '세션 삭제',
} as const;
