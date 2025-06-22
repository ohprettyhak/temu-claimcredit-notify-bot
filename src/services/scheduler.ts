import cron from 'node-cron';
import { DateTime } from 'luxon';
import { bot } from '../bot';
import { supabase } from '../db';
import { NotificationViewData, NotificationType } from '../types';
import { updateNotificationSentTime, claimButtons } from './index';
import { UI_MESSAGES, SYSTEM_ERROR_MESSAGES, DEV_LOGS } from '../constants';

const getDueNotifications = async (now: DateTime): Promise<NotificationViewData[]> => {
  const { data: currentNotifications, error: currentError } = await supabase
    .from('notifications_by_datetime_view')
    .select('*')
    .eq('year', now.year)
    .eq('month', now.month)
    .eq('day', now.day)
    .eq('hour', now.hour);

  if (currentError) {
    console.error(SYSTEM_ERROR_MESSAGES.ERROR_FETCHING_NOTIFICATIONS, currentError);
    throw currentError;
  }

  if (!currentNotifications?.length) {
    return [];
  }

  const eveningNotifications = currentNotifications.filter(n => n.notification_type === 'evening');

  if (!eveningNotifications.length) {
    console.log(
      DEV_LOGS.CURRENT_NOTIFICATIONS_FOUND(currentNotifications.length, now.toISO() || ''),
    );
    return currentNotifications;
  }

  const { data: morningNotifications, error: morningError } = await supabase
    .from('notifications_by_datetime_view')
    .select('session_id, notification_date, is_clicked')
    .eq('notification_type', 'morning')
    .in(
      'session_id',
      eveningNotifications.map(n => n.session_id),
    )
    .in('notification_date', [...new Set(eveningNotifications.map(n => n.notification_date))]);

  if (morningError) {
    console.error(SYSTEM_ERROR_MESSAGES.ERROR_FETCHING_NOTIFICATIONS, morningError);
  }

  const morningClaimedMap = new Map<string, boolean>();
  morningNotifications?.forEach(morning => {
    const key = `${morning.session_id}_${morning.notification_date}`;
    morningClaimedMap.set(key, morning.is_clicked);
  });

  const filteredNotifications = currentNotifications.filter(notification => {
    if (notification.notification_type === 'morning') {
      return true;
    }

    const key = `${notification.session_id}_${notification.notification_date}`;
    const morningClaimed = morningClaimedMap.get(key);

    if (morningClaimed) {
      console.log(
        DEV_LOGS.SKIPPING_EVENING_NOTIFICATION_DUE_TO_MORNING_CLAIM(
          notification.notification_id,
          notification.session_id,
        ),
      );
      return false;
    }

    return true;
  });

  if (filteredNotifications.length) {
    console.log(
      DEV_LOGS.CURRENT_NOTIFICATIONS_FOUND(filteredNotifications.length, now.toISO() || ''),
    );
  }

  return filteredNotifications;
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

  await bot.telegram.sendMessage(chatId, message, {
    reply_markup: claimButtons(notificationId).reply_markup,
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

    if (!dueNotifications.length) {
      console.log(DEV_LOGS.NO_DUE_NOTIFICATIONS(now.toISO() || ''));
      return;
    }

    console.log(DEV_LOGS.PROCESSING_NOTIFICATIONS(dueNotifications.length));

    for (const notification of dueNotifications) {
      await processNotification(notification, now);
    }

    console.log(DEV_LOGS.COMPLETED_PROCESSING(now.toISO() || ''));
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
