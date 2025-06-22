import cron from 'node-cron';
import { DateTime } from 'luxon';
import { bot } from '../bot';
import { supabase } from '../db';
import { NotificationViewData, NotificationType } from '../types';
import { updateNotificationSentTime, claimButtons } from './index';
import { UI_MESSAGES, APP_CONFIG, SYSTEM_ERROR_MESSAGES, DEV_LOGS } from '../constants';

const getDueNotifications = async (now: DateTime): Promise<NotificationViewData[]> => {
  const { data: currentNotifications, error: currentError } = await supabase
    .from('notifications_by_datetime_view')
    .select('*')
    .eq('year', now.year)
    .eq('month', now.month)
    .eq('day', now.day)
    .eq('hour', now.hour)
    .eq('is_overdue', false);

  const { data: overdueNotifications, error: overdueError } = await supabase
    .from('notifications_by_datetime_view')
    .select('*')
    .eq('is_overdue', true);

  if (currentError) {
    console.error(SYSTEM_ERROR_MESSAGES.ERROR_FETCHING_NOTIFICATIONS, currentError);
    throw currentError;
  }

  if (overdueError) {
    console.error(SYSTEM_ERROR_MESSAGES.ERROR_FETCHING_NOTIFICATIONS, overdueError);
    throw overdueError;
  }

  const allNotifications = [...(currentNotifications || []), ...(overdueNotifications || [])];
  
  if (currentNotifications?.length) {
    console.log(DEV_LOGS.CURRENT_NOTIFICATIONS_FOUND(currentNotifications.length, now.toISO() || ''));
  }
  if (overdueNotifications?.length) {
    console.log(DEV_LOGS.OVERDUE_NOTIFICATIONS_FOUND(overdueNotifications.length));
  }

  return allNotifications;
};

const sendNotificationMessage = async (
  chatId: number,
  notificationType: NotificationType,
  notificationId: string,
): Promise<void> => {
  const message =
    notificationType === 'morning'
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
    await sendNotificationMessage(
      notification.user_id,
      notification.notification_type,
      notification.notification_id,
    );

    const currentTimeISO = currentTime.toISO();
    if (currentTimeISO) {
      await updateNotificationSentTime(notification.notification_id, currentTimeISO);
    }

    console.log(DEV_LOGS.NOTIFICATION_SENT_SUCCESS(notification.notification_id));
  } catch (error) {
    console.error(
      SYSTEM_ERROR_MESSAGES.ERROR_IN_PROCESSING,
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

    const currentNotifications = dueNotifications.filter(n => !n.is_overdue);
    const overdueNotifications = dueNotifications.filter(n => n.is_overdue);

    console.log(DEV_LOGS.PROCESSING_NOTIFICATIONS(dueNotifications.length));
    if (currentNotifications.length > 0) {
      console.log(DEV_LOGS.PROCESSING_CURRENT_NOTIFICATIONS(currentNotifications.length));
    }
    if (overdueNotifications.length > 0) {
      console.log(DEV_LOGS.PROCESSING_OVERDUE_NOTIFICATIONS(overdueNotifications.length));
    }

    const uniqueNotifications = dueNotifications.filter((notification, index, self) => 
      index === self.findIndex(n => n.notification_id === notification.notification_id)
    );

    for (const notification of uniqueNotifications) {
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