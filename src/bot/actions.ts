import { Markup } from 'telegraf';
import { MyContext, hasCallbackData } from '../types';
import {
  markNotificationClaimed,
  deleteSession,
  getUserSessions,
  createSessionButtons,
} from '../services';
import { withErrorHandling, withCallbackValidation, withUserValidation } from '../utils';
import {
  UI_MESSAGES,
  SYSTEM_ERROR_MESSAGES,
  ACTION_NAMES,
  CALLBACK_PREFIXES,
  DEV_LOGS,
} from '../constants';

const _handleClaimAction = async (ctx: MyContext): Promise<void> => {
  if (!hasCallbackData(ctx)) {
    return;
  }

  const notificationId = ctx.callbackQuery.data.replace(CALLBACK_PREFIXES.CLAIM, '');
  await markNotificationClaimed(notificationId);
  await ctx.answerCbQuery(UI_MESSAGES.CREDIT_CLAIMED);

  try {
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
  } catch (editError) {
    console.log(DEV_LOGS.KEYBOARD_REMOVAL_FAILED);
  }

  await ctx.reply(UI_MESSAGES.CREDIT_CLAIMED);
};

export const handleClaimAction = withErrorHandling(
  withCallbackValidation(_handleClaimAction),
  SYSTEM_ERROR_MESSAGES.ACTION_ERROR(ACTION_NAMES.CLAIM_NOTIFICATION),
);

const _handleDeleteSessionAction = async (ctx: MyContext): Promise<void> => {
  if (!hasCallbackData(ctx)) {
    return;
  }

  const sessionId = ctx.callbackQuery.data.replace(CALLBACK_PREFIXES.DELETE_SESSION, '');
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
