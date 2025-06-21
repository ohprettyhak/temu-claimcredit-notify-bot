import { NODE_ENV } from './config';
import { initializeBot, bot } from './bot';
import { setupRoutes, setupWebhook, startServer } from './server';
import { gracefulShutdown } from './utils';
import { scheduleJobs } from './scheduler';
import { DEV_LOGS, ERROR_MESSAGES } from './constants';

const startPolling = async (): Promise<void> => {
  await bot.launch();
  console.log(DEV_LOGS.BOT_RUNNING);
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
