import { Telegraf, session, Scenes } from 'telegraf';
import express from 'express';
import { TELEGRAM_TOKEN, WEBHOOK_URL, WEBHOOK_PORT, WEBHOOK_PATH, NODE_ENV } from './config';
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
const app = express();

app.use(express.json());

bot.use(session());
bot.use(stage.middleware());

const initializeBot = (): void => {
  bot.command(COMMANDS.HELP, ctx => ctx.reply(MESSAGES.HELP_MESSAGE));
  bot.command(COMMANDS.START_SESSION, ctx => ctx.scene.enter('start_session'));
  bot.command(COMMANDS.STATUS, statusHandler);
  bot.command(COMMANDS.CANCEL_SESSION, cancelHandler);

  bot.action(ACTION_NAMES.CANCEL_SESSION, cancelHandler);

  bot.action(/^claim_/, async ctx => {
    try {
      if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
        await ctx.answerCbQuery(MESSAGES.PROCESSING_ERROR);
        return;
      }

      const notificationId = ctx.callbackQuery.data.replace('claim_', '');
      await markNotificationClaimed(notificationId);
      await ctx.answerCbQuery(MESSAGES.CREDIT_CLAIMED);
      await ctx.reply(MESSAGES.CREDIT_CLAIMED);
    } catch (error) {
      console.error(ERROR_MESSAGES.ACTION_ERROR(ACTION_NAMES.CLAIM_NOTIFICATION), error);
      await ctx.answerCbQuery(MESSAGES.PROCESSING_ERROR);
    }
  });

  bot.action(/^delete_session_/, async ctx => {
    try {
      if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
        await ctx.answerCbQuery(MESSAGES.PROCESSING_ERROR);
        return;
      }

      const sessionId = ctx.callbackQuery.data.replace('delete_session_', '');
      await deleteSession(sessionId);
      await ctx.answerCbQuery(MESSAGES.SESSION_DELETED);
      await ctx.reply(MESSAGES.SESSION_DELETED);
    } catch (error) {
      console.error(ERROR_MESSAGES.ACTION_ERROR(ERROR_MESSAGES.DELETE_SESSION_ACTION), error);
      await ctx.answerCbQuery(MESSAGES.PROCESSING_ERROR);
    }
  });

  bot.catch(error => {
    console.error(ERROR_MESSAGES.GLOBAL_BOT_ERROR, error);
  });
};

const setupWebhook = async (): Promise<void> => {
  try {
    const webhookUrl = `${WEBHOOK_URL}${WEBHOOK_PATH}`;
    await bot.telegram.setWebhook(webhookUrl);
    console.log(DEV_LOGS.WEBHOOK_URL_SET(webhookUrl));
  } catch (error) {
    console.error(ERROR_MESSAGES.WEBHOOK_SETUP_ERROR, error);
    throw error;
  }
};

const setupRoutes = (): void => {
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: MESSAGES.WEBHOOK_HEALTH_CHECK });
  });

  app.post(WEBHOOK_PATH, (req, res) => {
    try {
      console.log(DEV_LOGS.WEBHOOK_REQUEST_RECEIVED(req.method, req.path));
      bot.handleUpdate(req.body);
      res.status(200).send('OK');
    } catch (error) {
      console.error(ERROR_MESSAGES.WEBHOOK_REQUEST_ERROR, error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });
};

const startServer = (): void => {
  app.listen(WEBHOOK_PORT, () => {
    console.log(DEV_LOGS.WEBHOOK_SERVER_LISTENING(WEBHOOK_PORT));
  });
};

const startPolling = async (): Promise<void> => {
  await bot.launch();
  console.log(DEV_LOGS.BOT_RUNNING);
};

const gracefulShutdown = (): void => {
  const shutdown = async (signal: string): Promise<void> => {
    console.log(ERROR_MESSAGES.SHUTDOWN_SIGNAL_RECEIVED(signal));

    try {
      if (NODE_ENV === 'production') {
        await supabase.removeAllChannels();
      } else {
        bot.stop(signal);
      }
      process.exit(0);
    } catch (error) {
      console.error(ERROR_MESSAGES.SHUTDOWN_ERROR, error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

const main = async (): Promise<void> => {
  try {
    initializeBot();
    scheduleJobs();
    gracefulShutdown();

    if (NODE_ENV === 'production') {
      setupRoutes();
      await setupWebhook();
      startServer();
    } else {
      await startPolling();
    }

    console.log(DEV_LOGS.BOT_RUNNING);
  } catch (error) {
    console.error(ERROR_MESSAGES.BOT_INIT_FAILED, error);
    process.exit(1);
  }
};

main();
