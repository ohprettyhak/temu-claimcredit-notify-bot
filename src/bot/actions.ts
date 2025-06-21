import { Markup } from 'telegraf';
import { MyContext } from '../types';
import {
  markNotificationClaimed,
  deleteSession,
  getUserSessions,
  createSessionButtons,
} from '../services';
import { withErrorHandling, withCallbackValidation, withUserValidation } from '../utils';
import { MESSAGES, ERROR_MESSAGES, ACTION_NAMES } from '../constants';

const _handleClaimAction = async (ctx: MyContext): Promise<void> => {
  const data = (ctx.callbackQuery as any)?.data;
  const notificationId = data.replace('claim_', '');
  await markNotificationClaimed(notificationId);
  await ctx.answerCbQuery(MESSAGES.CREDIT_CLAIMED);
  await ctx.reply(MESSAGES.CREDIT_CLAIMED);
};

export const handleClaimAction = withErrorHandling(
  withCallbackValidation(_handleClaimAction),
  ERROR_MESSAGES.ACTION_ERROR(ACTION_NAMES.CLAIM_NOTIFICATION),
);

const _handleDeleteSessionAction = async (ctx: MyContext): Promise<void> => {
  const data = (ctx.callbackQuery as any)?.data;
  const sessionId = data.replace('delete_session_', '');
  await deleteSession(sessionId);
  await ctx.answerCbQuery(MESSAGES.SESSION_DELETED);

  const userId = ctx.from!.id;
  const remainingSessions = await getUserSessions(userId);

  if (remainingSessions.length === 0) {
    try {
      await ctx.editMessageText(MESSAGES.NO_SESSIONS_TO_CANCEL);
    } catch (editError) {
      await ctx.reply(MESSAGES.NO_SESSIONS_TO_CANCEL);
    }
  } else {
    const buttons = createSessionButtons(remainingSessions);
    const keyboard = Markup.inlineKeyboard(buttons);

    try {
      await ctx.editMessageText(MESSAGES.SELECT_SESSION_TO_CANCEL, keyboard);
    } catch (editError) {
      await ctx.reply(MESSAGES.SELECT_SESSION_TO_CANCEL, keyboard);
    }
  }

  await ctx.reply(MESSAGES.SESSION_DELETED);
};

export const handleDeleteSessionAction = withErrorHandling(
  withCallbackValidation(withUserValidation(_handleDeleteSessionAction)),
  ERROR_MESSAGES.ACTION_ERROR(ERROR_MESSAGES.DELETE_SESSION_ACTION),
);
