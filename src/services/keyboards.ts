import { Markup } from 'telegraf';
import { BUTTON_TEXT, CALLBACK_ACTIONS, CALLBACK_PREFIXES } from '../constants';

export const timezoneKeyboard = Markup.inlineKeyboard([
  ['Asia/Seoul', 'America/New_York', 'Europe/London'].map(tz =>
    Markup.button.callback(tz, `${CALLBACK_PREFIXES.TIMEZONE}${tz}`),
  ),
  [Markup.button.callback(BUTTON_TEXT.OTHER_TIMEZONE, CALLBACK_ACTIONS.TZ_OTHER)],
]);

export function timeKeyboard(prefix: 'MORN' | 'EVE') {
  let options: string[];

  if (prefix === 'MORN') {
    options = [
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
    ];
  } else {
    options = [
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
    ];
  }

  const rows = [];
  for (let i = 0; i < options.length; i += 4) {
    const row = options.slice(i, i + 4).map(t => Markup.button.callback(t, `${prefix}_${t}`));
    rows.push(row);
  }

  return Markup.inlineKeyboard(rows);
}

export const confirmKeyboard = Markup.inlineKeyboard([
  Markup.button.callback(BUTTON_TEXT.CONFIRM, CALLBACK_ACTIONS.CONFIRM),
  Markup.button.callback(BUTTON_TEXT.CANCEL, CALLBACK_ACTIONS.CANCEL),
]);

export function claimButtons(notifId: string) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(BUTTON_TEXT.CLAIMED, `${CALLBACK_ACTIONS.CLAIM}_${notifId}`)],
    [Markup.button.url(BUTTON_TEXT.GO_TO_TEMU, 'https://www.temu.com')],
  ]);
}

export const temuButton = Markup.inlineKeyboard([
  Markup.button.url(BUTTON_TEXT.GO_TO_TEMU, 'https://www.temu.com'),
]);
