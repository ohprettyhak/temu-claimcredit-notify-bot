import cron from 'node-cron';
import { DateTime } from 'luxon';
import { bot } from './bot';
import { supabase } from './db';
import { NotificationViewData, NotificationType } from './types';
import { getSessionUser, updateNotificationSentTime, claimButtons } from './services';
import { UI_MESSAGES, APP_CONFIG, SYSTEM_ERROR_MESSAGES, DEV_LOGS } from './constants';

const getDueNotifications = async (now: DateTime): Promise<NotificationViewData[]> => {
  const { data: notifications, error } = await supabase
    .from('notification_by_datetime_view')
    .select('*')
    .eq('year', now.year)
    .eq('month', now.month)
    .eq('day', now.day)
    .eq('hour', now.hour);

  if (error) {
    console.error(SYSTEM_ERROR_MESSAGES.ERROR_FETCHING_NOTIFICATIONS, error);
    throw error;
  }

  return notifications || [];
};

const sendNotificationMessage = async (
  chatId: number,
  notificationType: NotificationType,
  notificationId: string,
): Promise<void> => {
  const message =
    notificationType === APP_CONFIG.NOTIFICATION_TYPES.MORNING
      ? UI_MESSAGES.MORNING_NOTIFICATION
      : UI_MESSAGES.EVENING_NOTIFICATION;

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
      notification.notification_type as NotificationType,
      notification.notification_id,
    );

    const currentTimeISO = currentTime.toISO();
    if (currentTimeISO) {
      await updateNotificationSentTime(notification.notification_id, currentTimeISO);
    }

    console.log(DEV_LOGS.NOTIFICATION_SENT_SUCCESS(notification.notification_id));
  } catch (error) {
    console.error(
      UI_MESSAGES.NOTIFICATION_SEND_ERROR(notification.session_id, notification.notification_id),
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
    console.error(SYSTEM_ERROR_MESSAGES.ERROR_IN_PROCESSING, error);
  }
};

export const scheduleJobs = (): void => {
  cron.schedule('0 * * * *', processNotifications, {
    timezone: 'UTC',
  });

  console.log(DEV_LOGS.SCHEDULER_INITIALIZED);
};
