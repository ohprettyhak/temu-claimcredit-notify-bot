import { NODE_ENV } from './config';
import { initializeBot, bot } from './bot';
import { setupWebhook, setupRoutes, startServer } from './server';
import { scheduleJobs } from './scheduler';
import { DEV_LOGS, SYSTEM_ERROR_MESSAGES } from './constants';
import { gracefulShutdown } from './utils';

const startApp = async (): Promise<void> => {
  try {
    console.log(DEV_LOGS.BOT_RUNNING);
    
    initializeBot();

    if (NODE_ENV === 'production') {
      await setupWebhook();
      setupRoutes();
      startServer();
    } else {
      bot.launch();
    }

    scheduleJobs();
    gracefulShutdown();
  } catch (error) {
    console.error(SYSTEM_ERROR_MESSAGES.BOT_INIT_FAILED, error);
    process.exit(1);
  }
};

startApp();
