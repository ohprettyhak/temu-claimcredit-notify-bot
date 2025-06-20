import { Scenes } from 'telegraf';
import { timezoneKeyboard, timeKeyboard, confirmKeyboard } from '../services/keyboards';
import { DateTime } from 'luxon';
import { supabase } from '../db';
import { toUTC } from '../services/time';
import { MyContext, hasCallbackData, hasMessageText } from '../types';
import { MESSAGES, CALLBACK_ACTIONS, CALLBACK_PREFIXES } from '../constants';

export const startSession = new Scenes.WizardScene<MyContext>(
  'startSession',
  async ctx => {
    ctx.scene.state = {
      cursor: 0,
      timezone: undefined,
      morningTime: undefined,
      eveningTime: undefined,
      startDate: undefined,
    };
    await ctx.reply(MESSAGES.SELECT_TIMEZONE, timezoneKeyboard);
    return ctx.wizard.next();
  },

  async ctx => {
    let data: string | undefined;

    if (hasCallbackData(ctx)) {
      data = ctx.callbackQuery.data;
    } else if (hasMessageText(ctx)) {
      data = ctx.message.text;
    }

    if (typeof data !== 'string') {
      return ctx.reply(MESSAGES.INVALID_INPUT);
    }

    if (data === CALLBACK_ACTIONS.TZ_OTHER) {
      await ctx.reply(MESSAGES.ENTER_TIMEZONE);
      return;
    }

    if (data.startsWith(CALLBACK_PREFIXES.TIMEZONE)) {
      ctx.scene.state.timezone = data.split('_')[1];
    } else {
      ctx.scene.state.timezone = data.trim();
    }

    await ctx.reply(MESSAGES.SELECT_MORNING_TIME, timeKeyboard('MORN'));
    return ctx.wizard.next();
  },

  async ctx => {
    if (!hasCallbackData(ctx)) {
      return ctx.reply(MESSAGES.USE_BUTTONS_FOR_MORNING);
    }

    const data = ctx.callbackQuery.data;
    if (data.startsWith(CALLBACK_PREFIXES.MORNING_TIME)) {
      ctx.scene.state.morningTime = data.split('_')[1];
    } else {
      return ctx.reply(MESSAGES.USE_BUTTONS_FOR_MORNING);
    }

    await ctx.reply(MESSAGES.SELECT_EVENING_TIME, timeKeyboard('EVE'));
    return ctx.wizard.next();
  },

  async ctx => {
    if (!hasCallbackData(ctx)) {
      return ctx.reply(MESSAGES.USE_BUTTONS_FOR_EVENING);
    }

    const data = ctx.callbackQuery.data;
    if (data.startsWith(CALLBACK_PREFIXES.EVENING_TIME)) {
      ctx.scene.state.eveningTime = data.split('_')[1];
    } else {
      return ctx.reply(MESSAGES.USE_BUTTONS_FOR_EVENING);
    }

    const { timezone, morningTime, eveningTime } = ctx.scene.state;
    if (!timezone || !morningTime || !eveningTime) {
      return ctx.reply(MESSAGES.MISSING_INFO);
    }

    const today = DateTime.now().setZone(timezone).toISODate()!;
    ctx.scene.state.startDate = today;
    const end = DateTime.fromISO(today).plus({ days: 6 }).toISODate()!;

    await ctx.reply(
      MESSAGES.SESSION_CONFIRMATION(today, end, morningTime, eveningTime, timezone),
      confirmKeyboard,
    );
    return ctx.wizard.next();
  },

  async ctx => {
    if (!hasCallbackData(ctx)) {
      return ctx.reply(MESSAGES.USE_CONFIRMATION_BUTTONS);
    }

    const data = ctx.callbackQuery.data;
    if (data === CALLBACK_ACTIONS.CONFIRM) {
      const chatId = ctx.from!.id;
      const { timezone, morningTime, eveningTime, startDate } = ctx.scene.state;

      if (!timezone || !morningTime || !eveningTime || !startDate) {
        return ctx.reply(MESSAGES.MISSING_SESSION_DATA);
      }

      const endDate = DateTime.fromISO(startDate).plus({ days: 6 }).toISODate()!;

      await supabase.from('users').upsert({ user_id: chatId, timezone });

      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: chatId,
          start_date: startDate,
          end_date: endDate,
          morning_notification_time: morningTime,
          evening_notification_time: eveningTime,
        })
        .select()
        .single();

      if (sessionError || !session) {
        return ctx.reply(MESSAGES.SESSION_CREATION_FAILED);
      }

      const notifications: Array<{
        session_id: number;
        notification_date: string;
        notification_type: 'morning' | 'evening';
        notification_time_utc: string;
        is_clicked: boolean;
      }> = [];
      for (let i = 0; i < 7; i++) {
        const date = DateTime.fromISO(startDate).plus({ days: i }).toISODate()!;
        notifications.push({
          session_id: session.session_id,
          notification_date: date,
          notification_type: 'morning',
          notification_time_utc: toUTC(date, morningTime, timezone),
          is_clicked: false,
        });
        notifications.push({
          session_id: session.session_id,
          notification_date: date,
          notification_type: 'evening',
          notification_time_utc: toUTC(date, eveningTime, timezone),
          is_clicked: false,
        });
      }

      await supabase.from('notifications').insert(notifications);
      await ctx.reply(MESSAGES.SESSION_CONFIRMED);
    } else {
      await ctx.reply(MESSAGES.SESSION_CANCELLED);
    }
    return ctx.scene.leave();
  },
);
