import { Scenes, Markup } from 'telegraf';
import { DateTime } from 'luxon';
import { confirmKeyboard, timeKeyboard } from '../services/keyboards';
import { createUser, createSession, createNotifications } from '../services/database';
import { toUTC } from '../services/time';
import { hasCallbackData, hasMessageText, MyContext } from '../types';
import {
  CALLBACK_ACTIONS,
  CALLBACK_PREFIXES,
  MESSAGES,
  APP_CONFIG,
  ERROR_MESSAGES,
} from '../constants';

const DEFAULT_TIMEZONE = APP_CONFIG.DEFAULT_TIMEZONE;

type SessionCreationData = {
  sessionId: string;
  startDate: string;
  morningTime: string;
  eveningTime: string;
  timezone: string;
};

type NotificationData = {
  session_id: string;
  notification_date: string;
  notification_type:
    | typeof APP_CONFIG.NOTIFICATION_TYPES.MORNING
    | typeof APP_CONFIG.NOTIFICATION_TYPES.EVENING;
  notification_time_utc: string;
  is_clicked: boolean;
};

const checkForCancellation = (data: string): boolean => {
  return data.startsWith('/');
};

const buildFormMessage = (
  morningTime?: string,
  eveningTime?: string,
  currentStepMessage?: string,
): string => {
  let message = '';

  if (morningTime) {
    message += `${MESSAGES.MORNING_TIME_SELECTED(morningTime)}`;
  }

  if (eveningTime) {
    message += `\n${MESSAGES.EVENING_TIME_SELECTED(eveningTime)}`;
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
  const { morningTime, eveningTime } = ctx.scene.state;

  if (morningTime && eveningTime) {
    const message = buildFormMessage(morningTime, eveningTime, statusMessage);
    await updateFormMessage(ctx, message);
  }
};

const handleSessionCancellation = async (ctx: MyContext): Promise<void> => {
  const { morningTime, eveningTime } = ctx.scene.state;

  if (morningTime && eveningTime) {
    await updateFormStatus(ctx, MESSAGES.SESSION_CANCELLED_STATUS);
    await ctx.reply(MESSAGES.SESSION_CANCELLED_WITH_INFO(morningTime, eveningTime));
  } else {
    await ctx.reply(MESSAGES.SESSION_CANCELLED);
  }
};

const handleCancellation = async (ctx: MyContext): Promise<void> => {
  await handleSessionCancellation(ctx);
  await ctx.scene.leave();
};

const createNotificationData = (data: SessionCreationData): NotificationData[] => {
  const notifications: NotificationData[] = [];

  for (let i = 0; i < APP_CONFIG.SESSION_DURATION_DAYS; i++) {
    const date = DateTime.fromISO(data.startDate).plus({ days: i }).toISODate();

    if (!date) {
      throw new Error(`Invalid date calculation for day ${i} from ${data.startDate}`);
    }

    notifications.push(
      {
        session_id: data.sessionId,
        notification_date: date,
        notification_type: APP_CONFIG.NOTIFICATION_TYPES.MORNING,
        notification_time_utc: toUTC(date, data.morningTime, data.timezone),
        is_clicked: false,
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
  const { timezone, morningTime, eveningTime, startDate } = ctx.scene.state;
  return !!(timezone && morningTime && eveningTime && startDate);
};

const processSessionCreation = async (ctx: MyContext): Promise<void> => {
  try {
    if (!ctx.from) {
      await ctx.reply(MESSAGES.PROCESSING_ERROR);
      return;
    }

    if (!validateSessionData(ctx)) {
      await ctx.reply(MESSAGES.MISSING_SESSION_DATA);
      return;
    }

    const { morningTime, eveningTime, startDate } = ctx.scene.state;

    await updateFormStatus(ctx, MESSAGES.SESSION_PROCESSING);

    const endDate = DateTime.fromISO(startDate!)
      .plus({ days: APP_CONFIG.SESSION_DURATION_DAYS - 1 })
      .toISODate();

    if (!endDate) {
      await ctx.reply(MESSAGES.SESSION_CREATION_FAILED);
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
    };

    const notifications = createNotificationData(sessionData);
    await createNotifications(notifications);

    await updateFormStatus(ctx, MESSAGES.SESSION_SUCCESS);
  } catch (error) {
    console.error(ERROR_MESSAGES.SESSION_CREATION_ERROR, error);
    await updateFormStatus(ctx, MESSAGES.SESSION_CREATION_ERROR);
    await ctx.reply(MESSAGES.SESSION_CREATION_FAILED);
  }
};

const handleConfirmationStep = async (ctx: MyContext): Promise<void> => {
  if (!hasCallbackData(ctx)) {
    if (hasMessageText(ctx) && checkForCancellation(ctx.message.text)) {
      return;
    }
    await ctx.reply(MESSAGES.USE_CONFIRMATION_BUTTONS);
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

export const startSession = new Scenes.WizardScene<MyContext>(
  'startSession',

  // Step 1: Morning time selection
  async ctx => {
    ctx.scene.state = {
      cursor: 0,
      timezone: DEFAULT_TIMEZONE,
      morningTime: undefined,
      eveningTime: undefined,
      startDate: undefined,
      formMessageId: undefined,
    };

    const message = await ctx.reply(MESSAGES.SELECT_MORNING_TIME, timeKeyboard('MORN'));
    ctx.scene.state.formMessageId = message.message_id;
    return ctx.wizard.next();
  },

  // Step 2: Evening time selection
  async ctx => {
    if (!hasCallbackData(ctx)) {
      if (hasMessageText(ctx) && checkForCancellation(ctx.message.text)) {
        return handleCancellation(ctx);
      }
      return ctx.reply(MESSAGES.USE_BUTTONS_FOR_MORNING);
    }

    const data = ctx.callbackQuery.data;

    if (!data.startsWith(CALLBACK_PREFIXES.MORNING_TIME)) {
      return ctx.reply(MESSAGES.USE_BUTTONS_FOR_MORNING);
    }

    ctx.scene.state.morningTime = data.split('_')[1];

    const formMessage = buildFormMessage(
      ctx.scene.state.morningTime,
      undefined,
      MESSAGES.SELECT_EVENING_TIME,
    );

    await updateFormMessage(ctx, formMessage, timeKeyboard('EVE'));
    return ctx.wizard.next();
  },

  // Step 3: Confirmation
  async ctx => {
    if (!hasCallbackData(ctx)) {
      if (hasMessageText(ctx) && checkForCancellation(ctx.message.text)) {
        return handleCancellation(ctx);
      }
      return ctx.reply(MESSAGES.USE_BUTTONS_FOR_EVENING);
    }

    const data = ctx.callbackQuery.data;

    if (!data.startsWith(CALLBACK_PREFIXES.EVENING_TIME)) {
      return ctx.reply(MESSAGES.USE_BUTTONS_FOR_EVENING);
    }

    ctx.scene.state.eveningTime = data.split('_')[1];

    const { timezone, morningTime, eveningTime } = ctx.scene.state;

    if (!timezone || !morningTime || !eveningTime) {
      return ctx.reply(MESSAGES.MISSING_INFO);
    }

    const startDate = DateTime.now().setZone(timezone).toISODate();

    if (!startDate) {
      return ctx.reply(MESSAGES.PROCESSING_ERROR);
    }

    ctx.scene.state.startDate = startDate;

    const formMessage = buildFormMessage(morningTime, eveningTime, MESSAGES.FORM_CONFIRMATION);

    await updateFormMessage(ctx, formMessage, confirmKeyboard);
    return ctx.wizard.next();
  },

  // Step 4: Final confirmation and creation
  handleConfirmationStep,
);
