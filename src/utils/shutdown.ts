import { bot } from '../bot';
import { NODE_ENV } from '../config';
import { SYSTEM_ERROR_MESSAGES } from '../constants';
import { supabase } from '../db';

export const gracefulShutdown = (): void => {
  const shutdown = async (signal: string): Promise<void> => {
    console.log(SYSTEM_ERROR_MESSAGES.SHUTDOWN_SIGNAL_RECEIVED(signal));

    try {
      if (NODE_ENV === 'production') {
        await supabase.removeAllChannels();
      } else {
        bot.stop(signal);
      }
      process.exit(0);
    } catch (error) {
      console.error(SYSTEM_ERROR_MESSAGES.SHUTDOWN_ERROR, error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};
