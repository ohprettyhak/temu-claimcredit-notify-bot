import { Telegraf, session, Scenes } from 'telegraf';
import { TELEGRAM_TOKEN } from './config';
import { supabase } from './db';
import { startSession } from './handlers/startSession';
import statusHandler from './handlers/status';
import cancelHandler from './handlers/cancelSession';
import { scheduleJobs } from './scheduler';
import { markNotificationClaimed, deleteSession } from './services/database';
import { MyContext } from './types';
import { COMMANDS, MESSAGES, ERROR_MESSAGES, DEV_LOGS, ACTION_NAMES } from './constants';

export const bot = new Telegraf<MyContext>(TELEGRAM_TOKEN);
const stage = new Scenes.Stage<MyContext>([startSession]);

bot.use(session());
bot.use(stage.middleware());

const setupBotCommands = async (): Promise<void> => {
  await bot.telegram.setMyCommands([
    { command: COMMANDS.START_SESSION, description: MESSAGES.COMMAND_START_SESSION },
    { command: COMMANDS.STATUS, description: MESSAGES.COMMAND_STATUS },
    { command: COMMANDS.CANCEL_SESSION, description: MESSAGES.COMMAND_CANCEL_SESSION },
    { command: COMMANDS.HELP, description: MESSAGES.COMMAND_HELP },
  ]);
};

const handleCommandError = (command: string, error: unknown): void => {
  console.error(ERROR_MESSAGES.COMMAND_ERROR(command), error);
};

const handleActionError = (action: string, error: unknown): void => {
  console.error(ERROR_MESSAGES.ACTION_ERROR(action), error);
};

const safeEditMessage = async (ctx: MyContext, text: string): Promise<void> => {
  try {
    await ctx.editMessageText(text);
  } catch (editError: unknown) {
    if (editError && typeof editError === 'object' && 'response' in editError) {
      const telegramError = editError as { response?: { error_code?: number } };
      if (telegramError.response?.error_code !== 400) {
        throw editError;
      }
    } else {
      throw editError;
    }
  }
};

bot.start(async ctx => {
  try {
    await ctx.reply(MESSAGES.WELCOME);
  } catch (error) {
    handleCommandError('/start', error);
  }
});

bot.command(COMMANDS.HELP, async ctx => {
  try {
    await ctx.reply(MESSAGES.HELP, { parse_mode: 'HTML' });
  } catch (error) {
    handleCommandError('/help', error);
  }
});

bot.command(COMMANDS.START_SESSION, async ctx => {
  try {
    await ctx.scene.enter('startSession');
  } catch (error) {
    handleCommandError('/start_session', error);
  }
});

bot.command(COMMANDS.STATUS, async ctx => {
  try {
    await statusHandler(ctx);
  } catch (error) {
    handleCommandError('/status', error);
  }
});

bot.command(COMMANDS.CANCEL_SESSION, async ctx => {
  try {
    await cancelHandler(ctx);
  } catch (error) {
    handleCommandError('/cancel_session', error);
  }
});

bot.action(/CLAIM_(.+)/, async ctx => {
  try {
    const notificationId = ctx.match[1];

    const { data: notification, error } = await supabase
      .from('notifications')
      .select('session_id,notification_date')
      .eq('notification_id', notificationId)
      .single();

    if (error || !notification) {
      await ctx.answerCbQuery(MESSAGES.NOTIFICATION_NOT_FOUND);
      return;
    }

    await markNotificationClaimed(notificationId);
    await ctx.answerCbQuery(MESSAGES.MARKED_AS_CLAIMED);
  } catch (error) {
    handleActionError(ACTION_NAMES.CLAIM_NOTIFICATION, error);
    await ctx.answerCbQuery(MESSAGES.PROCESSING_ERROR);
  }
});

bot.action(/CANCEL_(.+)/, async ctx => {
  try {
    const sessionId = ctx.match[1];

    const { data: existingSession, error: sessionError } = await supabase
      .from('sessions')
      .select('session_id')
      .eq('session_id', sessionId)
      .single();

    if (sessionError || !existingSession) {
      await ctx.answerCbQuery(MESSAGES.SESSION_NOT_FOUND);
      return;
    }

    await deleteSession(sessionId);
    await ctx.answerCbQuery(MESSAGES.SESSION_CANCELLED);
    await safeEditMessage(ctx, MESSAGES.SESSION_CANCELLED);
  } catch (error) {
    handleActionError(ACTION_NAMES.CANCEL_SESSION, error);
    await ctx.answerCbQuery(MESSAGES.PROCESSING_ERROR);
  }
});

bot.catch(error => {
  console.error(ERROR_MESSAGES.GLOBAL_BOT_ERROR, error);
});

const initializeBot = async (): Promise<void> => {
  try {
    await setupBotCommands();
    scheduleJobs();

    await bot.launch();
    console.log(DEV_LOGS.BOT_RUNNING);
  } catch (error) {
    console.error(ERROR_MESSAGES.BOT_INIT_FAILED, error);
    process.exit(1);
  }
};

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

initializeBot();
