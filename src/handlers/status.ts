import { DateTime } from 'luxon';
import { MyContext } from '../types';
import { getUserSessions, getNotificationStatus } from '../services/database';
import { formatSessionInfo } from '../utils/formatters';
import { MESSAGES, APP_CONFIG, ERROR_MESSAGES } from '../constants';

const DEFAULT_TIMEZONE = APP_CONFIG.DEFAULT_TIMEZONE;

const statusHandler = async (ctx: MyContext): Promise<void> => {
  try {
    if (!ctx.from) {
      await ctx.reply(MESSAGES.PROCESSING_ERROR);
      return;
    }

    const userId = ctx.from.id;
    const today = DateTime.utc().setZone(DEFAULT_TIMEZONE).toISODate();

    if (!today) {
      await ctx.reply(MESSAGES.PROCESSING_ERROR);
      return;
    }

    const sessions = await getUserSessions(userId);

    if (sessions.length === 0) {
      await ctx.reply(MESSAGES.NO_ACTIVE_SESSIONS);
      return;
    }

    let message = `${MESSAGES.ACTIVE_SESSIONS}\n`;

    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      const currentDay =
        DateTime.fromISO(today).diff(DateTime.fromISO(session.start_date), 'days').days + 1;

      const isClicked = await getNotificationStatus(
        session.session_id,
        today,
        APP_CONFIG.NOTIFICATION_TYPES.MORNING,
      );

      message += `${formatSessionInfo(session, i, currentDay, isClicked)}\n`;
    }

    await ctx.reply(message);
  } catch (error) {
    console.error(ERROR_MESSAGES.STATUS_HANDLER_ERROR, error);

    if (error instanceof Error && error.message === MESSAGES.FAILED_TO_FETCH_SESSIONS) {
      await ctx.reply(MESSAGES.SESSIONS_FETCH_FAILED);
    } else {
      await ctx.reply(MESSAGES.STATUS_ERROR);
    }
  }
};

export default statusHandler;
