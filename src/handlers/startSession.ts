import { Scenes, Markup } from 'telegraf';
import { DateTime } from 'luxon';
import {
  confirmKeyboard,
  timeKeyboard,
  todayClaimKeyboard,
  createUser,
  createSession,
  createNotifications,
  toUTC,
} from '../services';
import { hasCallbackData, hasMessageText, MyContext, SessionCreationData } from '../types';
import {
  CALLBACK_ACTIONS,
  CALLBACK_PREFIXES,
  SCENE_IDS,
  VALIDATION_PATTERNS,
  UI_MESSAGES,
  APP_CONFIG,
  SYSTEM_ERROR_MESSAGES,
} from '../constants';

const DEFAULT_TIMEZONE = APP_CONFIG.DEFAULT_TIMEZONE;

const checkForCancellation = (data: string): boolean => {
  return VALIDATION_PATTERNS.COMMAND.test(data);
};

const buildFormMessage = (
  morningTime?: string,
  eveningTime?: string,
  todayClaimStatus?: boolean,
  currentStepMessage?: string,
): string => {
  let message = '';

  if (morningTime) {
    message += `${UI_MESSAGES.MORNING_TIME_SELECTED(morningTime)}`;
  }

  if (eveningTime) {
    message += `\n${UI_MESSAGES.EVENING_TIME_SELECTED(eveningTime)}`;
  }

  if (typeof todayClaimStatus === 'boolean') {
    message += `\n${todayClaimStatus ? UI_MESSAGES.TODAY_CLAIMED_SELECTED : UI_MESSAGES.TODAY_NOT_CLAIMED_SELECTED}`;
  }

  if (currentStepMessage) {
    message += `\n\n${currentStepMessage}`;
  }

  return message;
};

const updateFormMessage = async (
  ctx: MyContext,
  message: string,
  keyboard?: ReturnType<typeof Markup.inlineKeyboard>,
): Promise<void> => {
  const formMessageId = ctx.scene.state.formMessageId;

  if (formMessageId && ctx.chat) {
    try {
      await ctx.telegram.editMessageText(ctx.chat.id, formMessageId, undefined, message, keyboard);
    } catch (error) {
      await ctx.reply(message, keyboard);
    }
  } else {
    await ctx.reply(message, keyboard);
  }
};

const updateFormStatus = async (ctx: MyContext, statusMessage: string): Promise<void> => {
  const { morningTime, eveningTime, todayClaimStatus } = ctx.scene.state;

  if (morningTime && eveningTime && typeof todayClaimStatus === 'boolean') {
    const message = buildFormMessage(morningTime, eveningTime, todayClaimStatus, statusMessage);
    await updateFormMessage(ctx, message);
  }
};

const handleSessionCancellation = async (ctx: MyContext): Promise<void> => {
  const { morningTime, eveningTime } = ctx.scene.state;

  if (morningTime && eveningTime) {
    await updateFormStatus(ctx, UI_MESSAGES.SESSION_CANCELLED_STATUS);
    await ctx.reply(UI_MESSAGES.SESSION_CANCELLED_WITH_INFO(morningTime, eveningTime));
  } else {
    await ctx.reply(UI_MESSAGES.SESSION_CANCELLED);
  }
};

const handleCancellation = async (ctx: MyContext): Promise<void> => {
  await handleSessionCancellation(ctx);
  await ctx.scene.leave();
};

const createNotificationData = (data: SessionCreationData) => {
  const notifications = [];

  for (let i = 0; i < APP_CONFIG.SESSION_DURATION_DAYS; i++) {
    const date = DateTime.fromISO(data.startDate).plus({ days: i }).toISODate();

    if (!date) {
      throw new Error(`Invalid date calculation for day ${i} from ${data.startDate}`);
    }

    const isTodayMorning = i === 0;
    const isTodayMorningClaimed = isTodayMorning && data.todayClaimStatus;

    notifications.push(
      {
        session_id: data.sessionId,
        notification_date: date,
        notification_type: APP_CONFIG.NOTIFICATION_TYPES.MORNING,
        notification_time_utc: toUTC(date, data.morningTime, data.timezone),
        is_clicked: isTodayMorningClaimed,
      },
      {
        session_id: data.sessionId,
        notification_date: date,
        notification_type: APP_CONFIG.NOTIFICATION_TYPES.EVENING,
        notification_time_utc: toUTC(date, data.eveningTime, data.timezone),
        is_clicked: false,
      },
    );
  }

  return notifications;
};

const validateSessionData = (ctx: MyContext): boolean => {
  const { timezone, morningTime, eveningTime, startDate, todayClaimStatus } = ctx.scene.state;
  return !!(
    timezone &&
    morningTime &&
    eveningTime &&
    startDate &&
    typeof todayClaimStatus === 'boolean'
  );
};

const processSessionCreation = async (ctx: MyContext): Promise<void> => {
  try {
    if (!ctx.from) {
      await ctx.reply(UI_MESSAGES.PROCESSING_ERROR);
      return;
    }

    if (!validateSessionData(ctx)) {
      await ctx.reply(UI_MESSAGES.MISSING_SESSION_DATA);
      return;
    }

    const { morningTime, eveningTime, startDate, todayClaimStatus } = ctx.scene.state;

    await updateFormStatus(ctx, UI_MESSAGES.SESSION_PROCESSING);

    const endDate = DateTime.fromISO(startDate!)
      .plus({ days: APP_CONFIG.SESSION_DURATION_DAYS - 1 })
      .toISODate();

    if (!endDate) {
      await ctx.reply(UI_MESSAGES.SESSION_CREATION_FAILED);
      return;
    }

    await createUser(ctx.from.id, DEFAULT_TIMEZONE);

    const session = await createSession({
      user_id: ctx.from.id,
      start_date: startDate!,
      end_date: endDate,
      morning_notification_time: morningTime!,
      evening_notification_time: eveningTime!,
    });

    const sessionData: SessionCreationData = {
      sessionId: session.session_id,
      startDate: startDate!,
      morningTime: morningTime!,
      eveningTime: eveningTime!,
      timezone: DEFAULT_TIMEZONE,
      userId: ctx.from.id,
      todayClaimStatus: todayClaimStatus!,
    };

    const notifications = createNotificationData(sessionData);
    await createNotifications(notifications);

    await updateFormStatus(ctx, UI_MESSAGES.SESSION_SUCCESS);
  } catch (error) {
    console.error(SYSTEM_ERROR_MESSAGES.SESSION_CREATION_ERROR, error);
    await updateFormStatus(ctx, UI_MESSAGES.SESSION_CREATION_ERROR);
    await ctx.reply(UI_MESSAGES.SESSION_CREATION_FAILED);
  }
};

const handleConfirmationStep = async (ctx: MyContext): Promise<void> => {
  if (!hasCallbackData(ctx)) {
    if (hasMessageText(ctx) && checkForCancellation(ctx.message.text)) {
      return;
    }
    await ctx.reply(UI_MESSAGES.USE_CONFIRMATION_BUTTONS);
    return;
  }

  const data = ctx.callbackQuery.data;

  if (data === CALLBACK_ACTIONS.CONFIRM) {
    await processSessionCreation(ctx);
  } else {
    await handleSessionCancellation(ctx);
  }

  await ctx.scene.leave();
};

const handleTodayClaimStep = async (ctx: MyContext): Promise<void> => {
  if (!hasCallbackData(ctx)) {
    if (hasMessageText(ctx) && checkForCancellation(ctx.message.text)) {
      return handleCancellation(ctx);
    }
    await ctx.reply(UI_MESSAGES.USE_TODAY_CREDIT_BUTTONS);
    return;
  }

  const data = ctx.callbackQuery.data;
  const { morningTime, eveningTime } = ctx.scene.state;

  if (data === CALLBACK_ACTIONS.TODAY_CLAIMED) {
    ctx.scene.state.todayClaimStatus = true;
    const formMessage = buildFormMessage(
      morningTime,
      eveningTime,
      true,
      UI_MESSAGES.FORM_CONFIRMATION,
    );
    await updateFormMessage(ctx, formMessage, confirmKeyboard);
    ctx.wizard.next();
  } else if (data === CALLBACK_ACTIONS.TODAY_NOT_CLAIMED) {
    ctx.scene.state.todayClaimStatus = false;
    const formMessage = buildFormMessage(
      morningTime,
      eveningTime,
      false,
      UI_MESSAGES.FORM_CONFIRMATION,
    );
    await updateFormMessage(ctx, formMessage, confirmKeyboard);
    ctx.wizard.next();
  } else {
    await ctx.reply(UI_MESSAGES.USE_TODAY_CREDIT_BUTTONS);
    return;
  }
};

export const startSession = new Scenes.WizardScene<MyContext>(
  SCENE_IDS.START_SESSION,

  async ctx => {
    ctx.scene.state = {
      cursor: 0,
      timezone: DEFAULT_TIMEZONE,
      morningTime: undefined,
      eveningTime: undefined,
      startDate: undefined,
      formMessageId: undefined,
      todayClaimStatus: undefined,
    };

    const message = await ctx.reply(UI_MESSAGES.SELECT_MORNING_TIME, timeKeyboard('MORN'));
    ctx.scene.state.formMessageId = message.message_id;
    return ctx.wizard.next();
  },

  async ctx => {
    if (!hasCallbackData(ctx)) {
      if (hasMessageText(ctx) && checkForCancellation(ctx.message.text)) {
        return handleCancellation(ctx);
      }
      return ctx.reply(UI_MESSAGES.USE_BUTTONS_FOR_MORNING);
    }

    const data = ctx.callbackQuery.data;

    if (!data.startsWith(CALLBACK_PREFIXES.MORNING_TIME)) {
      return ctx.reply(UI_MESSAGES.USE_BUTTONS_FOR_MORNING);
    }

    ctx.scene.state.morningTime = data.split('_')[1];

    const formMessage = buildFormMessage(
      ctx.scene.state.morningTime,
      undefined,
      undefined,
      UI_MESSAGES.SELECT_EVENING_TIME,
    );

    await updateFormMessage(ctx, formMessage, timeKeyboard('EVE'));
    return ctx.wizard.next();
  },

  async ctx => {
    if (!hasCallbackData(ctx)) {
      if (hasMessageText(ctx) && checkForCancellation(ctx.message.text)) {
        return handleCancellation(ctx);
      }
      return ctx.reply(UI_MESSAGES.USE_BUTTONS_FOR_EVENING);
    }

    const data = ctx.callbackQuery.data;

    if (!data.startsWith(CALLBACK_PREFIXES.EVENING_TIME)) {
      return ctx.reply(UI_MESSAGES.USE_BUTTONS_FOR_EVENING);
    }

    ctx.scene.state.eveningTime = data.split('_')[1];

    const { timezone, morningTime, eveningTime } = ctx.scene.state;

    if (!timezone || !morningTime || !eveningTime) {
      return ctx.reply(UI_MESSAGES.MISSING_INFO);
    }

    const startDate = DateTime.now().setZone(timezone).toISODate();

    if (!startDate) {
      return ctx.reply(UI_MESSAGES.PROCESSING_ERROR);
    }

    ctx.scene.state.startDate = startDate;

    const formMessage = buildFormMessage(
      morningTime,
      eveningTime,
      undefined,
      UI_MESSAGES.TODAY_CREDIT_QUESTION,
    );

    await updateFormMessage(ctx, formMessage, todayClaimKeyboard);
    return ctx.wizard.next();
  },

  handleTodayClaimStep,

  handleConfirmationStep,
);
