import { Markup } from 'telegraf';
import { MyContext } from '../types';
import {
  markNotificationClaimed,
  deleteSession,
  getUserSessions,
  createSessionButtons,
} from '../services';
import { withErrorHandling, withCallbackValidation, withUserValidation } from '../utils';
import { UI_MESSAGES, SYSTEM_ERROR_MESSAGES, ACTION_NAMES } from '../constants';

const _handleClaimAction = async (ctx: MyContext): Promise<void> => {
  const data = (ctx.callbackQuery as any)?.data;
  const notificationId = data.replace('claim_', '');
  await markNotificationClaimed(notificationId);
  await ctx.answerCbQuery(UI_MESSAGES.CREDIT_CLAIMED);
  await ctx.reply(UI_MESSAGES.CREDIT_CLAIMED);
};

export const handleClaimAction = withErrorHandling(
  withCallbackValidation(_handleClaimAction),
  SYSTEM_ERROR_MESSAGES.ACTION_ERROR(ACTION_NAMES.CLAIM_NOTIFICATION),
);

const _handleDeleteSessionAction = async (ctx: MyContext): Promise<void> => {
  const data = (ctx.callbackQuery as any)?.data;
  const sessionId = data.replace('delete_session_', '');
  await deleteSession(sessionId);
  await ctx.answerCbQuery(UI_MESSAGES.SESSION_DELETED);

  const userId = ctx.from!.id;
  const remainingSessions = await getUserSessions(userId);

  if (remainingSessions.length === 0) {
    try {
      await ctx.editMessageText(UI_MESSAGES.NO_SESSIONS_TO_CANCEL);
    } catch (editError) {
      await ctx.reply(UI_MESSAGES.NO_SESSIONS_TO_CANCEL);
    }
  } else {
    const buttons = createSessionButtons(remainingSessions);
    const keyboard = Markup.inlineKeyboard(buttons);

    try {
      await ctx.editMessageText(UI_MESSAGES.SELECT_SESSION_TO_CANCEL, keyboard);
    } catch (editError) {
      await ctx.reply(UI_MESSAGES.SELECT_SESSION_TO_CANCEL, keyboard);
    }
  }

  await ctx.reply(UI_MESSAGES.SESSION_DELETED);
};

export const handleDeleteSessionAction = withErrorHandling(
  withCallbackValidation(withUserValidation(_handleDeleteSessionAction)),
  SYSTEM_ERROR_MESSAGES.ACTION_ERROR(ACTION_NAMES.DELETE_SESSION),
);
