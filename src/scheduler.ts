import cron from 'node-cron';
import { supabase } from './db';
import { bot } from './index';
import { DateTime } from 'luxon';
import { claimButtons } from './services/keyboards';
import { MESSAGES } from './constants';

export const scheduleJobs = () => {
  cron.schedule('0 * * * *', async () => {
    const now = DateTime.utc();

    const { data: due, error: dueError } = await supabase
      .from('notification_by_datetime_view')
      .select('*')
      .eq('year', now.year)
      .eq('month', now.month)
      .eq('day', now.day)
      .eq('hour', now.hour);

    if (dueError) {
      console.error('Error fetching notifications from view:', dueError);
      return;
    }

    if (!due || due.length === 0) {
      console.log('No due notifications for this hour.');
      return;
    }

    for (const notification of due) {
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('user_id')
        .eq('session_id', notification.session_id)
        .single();

      if (sessionError || !session) {
        console.error(MESSAGES.SESSION_FETCH_ERROR);
        continue;
      }

      const chatId = session.user_id;

      try {
        if (notification.notification_type === 'morning') {
          await bot.telegram.sendMessage(chatId, MESSAGES.MORNING_NOTIFICATION, {
            reply_markup: claimButtons(notification.notification_id.toString()).reply_markup,
          });
        } else {
          await bot.telegram.sendMessage(chatId, MESSAGES.EVENING_NOTIFICATION, {
            reply_markup: claimButtons(notification.notification_id.toString()).reply_markup,
          });
        }

        await supabase
          .from('notifications')
          .update({ sent_time_utc: now.toISO() })
          .eq('notification_id', notification.notification_id);
      } catch (error) {
        console.error(
          MESSAGES.NOTIFICATION_SEND_ERROR(chatId.toString(), String(notification.notification_id)),
          error,
        );
      }
    }
  });
};
