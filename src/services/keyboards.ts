import { Markup } from 'telegraf';

import { BUTTON_TEXTS, CALLBACK_ACTIONS, CALLBACK_PREFIXES, APP_CONFIG } from '../constants';
import { TimeType } from '../types';

type TimeButtonRow = ReturnType<typeof Markup.button.callback>[];

const BUTTONS_PER_ROW = 4;

const MORNING_TIMES = [
  '00:00',
  '01:00',
  '02:00',
  '03:00',
  '04:00',
  '05:00',
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
] as const;
const EVENING_TIMES = [
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
] as const;

const getTimeOptions = (type: TimeType): readonly string[] => {
  return type === 'MORN' ? MORNING_TIMES : EVENING_TIMES;
};

const createTimeButtonRows = (timeOptions: readonly string[], type: TimeType): TimeButtonRow[] => {
  const rows: TimeButtonRow[] = [];

  for (let i = 0; i < timeOptions.length; i += BUTTONS_PER_ROW) {
    const rowTimes = timeOptions.slice(i, i + BUTTONS_PER_ROW);
    const row = rowTimes.map(time => Markup.button.callback(time, `${type}_${time}`));
    rows.push(row);
  }

  return rows;
};

export const timeKeyboard = (type: TimeType): ReturnType<typeof Markup.inlineKeyboard> => {
  const timeOptions = getTimeOptions(type);
  const rows = createTimeButtonRows(timeOptions, type);

  return Markup.inlineKeyboard(rows);
};

export const confirmKeyboard = Markup.inlineKeyboard([
  Markup.button.callback(BUTTON_TEXTS.CONFIRM, CALLBACK_ACTIONS.CONFIRM),
  Markup.button.callback(BUTTON_TEXTS.CANCEL, CALLBACK_ACTIONS.CANCEL),
]);

export const todayClaimKeyboard = Markup.inlineKeyboard([
  Markup.button.callback(BUTTON_TEXTS.TODAY_CLAIMED, CALLBACK_ACTIONS.TODAY_CLAIMED),
  Markup.button.callback(BUTTON_TEXTS.TODAY_NOT_CLAIMED, CALLBACK_ACTIONS.TODAY_NOT_CLAIMED),
]);

export const claimButtons = (notificationId: string): ReturnType<typeof Markup.inlineKeyboard> => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(BUTTON_TEXTS.CLAIMED, `${CALLBACK_PREFIXES.CLAIM}${notificationId}`),
      Markup.button.url(BUTTON_TEXTS.GO_TO_TEMU, APP_CONFIG.URLS.TEMU),
    ],
  ]);
};

export const createSessionButtons = (sessions: { session_id: string }[]) => {
  return sessions.map((session, index) =>
    Markup.button.callback(
      `${BUTTON_TEXTS.SESSION_PREFIX}${index + 1}`,
      `${CALLBACK_PREFIXES.DELETE_SESSION}${session.session_id}`,
    ),
  );
};
