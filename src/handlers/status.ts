import { DateTime } from 'luxon';
import { MyContext } from '../types';
import { getUserSessions, getNotificationStatus } from '../services';
import { UI_MESSAGES, APP_CONFIG, SYSTEM_ERROR_MESSAGES } from '../constants';
import { withErrorHandling, withUserValidation } from '../utils';

const generateStatusMessage = async (userId: number): Promise<string> => {
  const sessions = await getUserSessions(userId);

  if (sessions.length === 0) {
    return UI_MESSAGES.NO_ACTIVE_SESSIONS;
  }

  let statusMessage = UI_MESSAGES.ACTIVE_SESSIONS;

  for (const session of sessions) {
    const startDate = DateTime.fromISO(session.start_date);
    const endDate = DateTime.fromISO(session.end_date);
    const now = DateTime.now();

    statusMessage += `\n\n📅 ${session.session_id}`;
    statusMessage += `\n🕐 ${session.morning_notification_time} / ${session.evening_notification_time}`;
    statusMessage += `\n📆 ${startDate.toFormat('yyyy-MM-dd')} ~ ${endDate.toFormat('yyyy-MM-dd')}`;

    let checkedDays = 0;
    let totalDays = 0;

    for (let date = startDate; date <= endDate; date = date.plus({ days: 1 })) {
      if (date > now) break;

      totalDays++;
      const dateStr = date.toISODate()!;

      const morningClaimed = await getNotificationStatus(
        session.session_id,
        dateStr,
        APP_CONFIG.NOTIFICATION_TYPES.MORNING,
      );
      const eveningClaimed = await getNotificationStatus(
        session.session_id,
        dateStr,
        APP_CONFIG.NOTIFICATION_TYPES.EVENING,
      );

      if (morningClaimed && eveningClaimed) {
        checkedDays++;
      }
    }

    statusMessage += `\n✅ 완료: ${checkedDays}/${totalDays}일`;
  }

  return statusMessage;
};

const _statusHandler = async (ctx: MyContext): Promise<void> => {
  try {
    const userId = ctx.from!.id;
    const statusMessage = await generateStatusMessage(userId);
    await ctx.reply(statusMessage);
  } catch (error) {
    console.error(SYSTEM_ERROR_MESSAGES.STATUS_HANDLER_ERROR, error);
    await ctx.reply(UI_MESSAGES.STATUS_ERROR);
  }
};

export const statusHandler = withErrorHandling(
  withUserValidation(_statusHandler),
  SYSTEM_ERROR_MESSAGES.STATUS_HANDLER_ERROR,
);
