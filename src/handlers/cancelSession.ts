import { Markup } from 'telegraf';

import { UI_MESSAGES, SYSTEM_ERROR_MESSAGES } from '../constants';
import { getUserSessions, createSessionButtons } from '../services';
import { MyContext } from '../types';

export const cancelHandler = async (ctx: MyContext): Promise<void> => {
  try {
    if (!ctx.from) {
      await ctx.reply(UI_MESSAGES.PROCESSING_ERROR);
      return;
    }

    const userId = ctx.from.id;

    const sessions = await getUserSessions(userId);

    if (sessions.length === 0) {
      await ctx.reply(UI_MESSAGES.NO_SESSIONS_TO_CANCEL);
      return;
    }

    const buttons = createSessionButtons(sessions);
    const keyboard = Markup.inlineKeyboard(buttons);

    await ctx.reply(UI_MESSAGES.SELECT_SESSION_TO_CANCEL, keyboard);
  } catch (error) {
    console.error(SYSTEM_ERROR_MESSAGES.CANCEL_SESSION_HANDLER_ERROR, error);

    if (error instanceof Error && error.message === UI_MESSAGES.FAILED_TO_FETCH_SESSIONS) {
      await ctx.reply(UI_MESSAGES.SESSION_CANCEL_ERROR);
    } else {
      await ctx.reply(UI_MESSAGES.CANCEL_SESSION_ERROR);
    }
  }
};
