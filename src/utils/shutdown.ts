import { supabase } from '../db';
import { bot } from '../bot';
import { NODE_ENV } from '../config';
import { ERROR_MESSAGES } from '../constants';

export const gracefulShutdown = (): void => {
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
