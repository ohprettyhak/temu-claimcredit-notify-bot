import { Markup } from 'telegraf';
import { MyContext, DatabaseSession } from '../types';
import { getUserSessions } from '../services/database';
import { MESSAGES, BUTTON_TEXT, ERROR_MESSAGES } from '../constants';

const createSessionButtons = (sessions: DatabaseSession[]) => {
  return sessions.map((session, index) =>
    Markup.button.callback(
      `${BUTTON_TEXT.SESSION_PREFIX}${index + 1}`,
      `CANCEL_${session.session_id}`,
    ),
  );
};

const cancelSession = async (ctx: MyContext): Promise<void> => {
  try {
    if (!ctx.from) {
      await ctx.reply(MESSAGES.PROCESSING_ERROR);
      return;
    }

    const userId = ctx.from.id;

    const sessions = await getUserSessions(userId);

    if (sessions.length === 0) {
      await ctx.reply(MESSAGES.NO_SESSIONS_TO_CANCEL);
      return;
    }

    const buttons = createSessionButtons(sessions);
    const keyboard = Markup.inlineKeyboard(buttons);

    await ctx.reply(MESSAGES.SELECT_SESSION_TO_CANCEL, keyboard);
  } catch (error) {
    console.error(ERROR_MESSAGES.CANCEL_SESSION_HANDLER_ERROR, error);

    if (error instanceof Error && error.message === MESSAGES.FAILED_TO_FETCH_SESSIONS) {
      await ctx.reply(MESSAGES.SESSION_CANCEL_ERROR);
    } else {
      await ctx.reply(MESSAGES.CANCEL_SESSION_ERROR);
    }
  }
};

export default cancelSession;
