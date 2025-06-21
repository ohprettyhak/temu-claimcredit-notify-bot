import cron from 'node-cron';
import { DateTime } from 'luxon';
import { bot } from './bot';
import { supabase } from './db';
import { NotificationViewData } from './types';
import { getSessionUser, updateNotificationSentTime, claimButtons } from './services';
import { MESSAGES, APP_CONFIG, ERROR_MESSAGES, DEV_LOGS } from './constants';

const getDueNotifications = async (now: DateTime): Promise<NotificationViewData[]> => {
  const { data: notifications, error } = await supabase
    .from('notification_by_datetime_view')
    .select('*')
    .eq('year', now.year)
    .eq('month', now.month)
    .eq('day', now.day)
    .eq('hour', now.hour);

  if (error) {
    console.error(ERROR_MESSAGES.ERROR_FETCHING_NOTIFICATIONS, error);
    throw error;
  }

  return notifications || [];
};

const sendNotificationMessage = async (
  chatId: number,
  notificationType:
    | typeof APP_CONFIG.NOTIFICATION_TYPES.MORNING
    | typeof APP_CONFIG.NOTIFICATION_TYPES.EVENING,
  notificationId: string,
): Promise<void> => {
  const message =
    notificationType === APP_CONFIG.NOTIFICATION_TYPES.MORNING
      ? MESSAGES.MORNING_NOTIFICATION
      : MESSAGES.EVENING_NOTIFICATION;

  const keyboard = claimButtons(notificationId);

  await bot.telegram.sendMessage(chatId, message, {
    reply_markup: keyboard.reply_markup,
  });
};

const processNotification = async (
  notification: NotificationViewData,
  currentTime: DateTime,
): Promise<void> => {
  try {
    const userId = await getSessionUser(notification.session_id);

    await sendNotificationMessage(
      userId,
      notification.notification_type as
        | typeof APP_CONFIG.NOTIFICATION_TYPES.MORNING
        | typeof APP_CONFIG.NOTIFICATION_TYPES.EVENING,
      notification.notification_id,
    );

    const currentTimeISO = currentTime.toISO();
    if (currentTimeISO) {
      await updateNotificationSentTime(notification.notification_id, currentTimeISO);
    }

    console.log(DEV_LOGS.NOTIFICATION_SENT_SUCCESS(String(notification.notification_id)));
  } catch (error) {
    console.error(
      MESSAGES.NOTIFICATION_SEND_ERROR(
        String(notification.session_id),
        String(notification.notification_id),
      ),
      error,
    );
  }
};

const processNotifications = async (): Promise<void> => {
  try {
    const now = DateTime.utc();
    const dueNotifications = await getDueNotifications(now);

    const nowISO = now.toISO();
    if (dueNotifications.length === 0) {
      if (nowISO) {
        console.log(DEV_LOGS.NO_DUE_NOTIFICATIONS(nowISO));
      }
      return;
    }

    console.log(DEV_LOGS.PROCESSING_NOTIFICATIONS(dueNotifications.length));

    for (const notification of dueNotifications) {
      await processNotification(notification, now);
    }

    if (nowISO) {
      console.log(DEV_LOGS.COMPLETED_PROCESSING(nowISO));
    }
  } catch (error) {
    console.error(ERROR_MESSAGES.ERROR_IN_PROCESSING, error);
  }
};

export const scheduleJobs = (): void => {
  cron.schedule('0 * * * *', processNotifications, {
    timezone: 'UTC',
  });

  console.log(DEV_LOGS.SCHEDULER_INITIALIZED);
};
