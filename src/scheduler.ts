import cron from 'node-cron';
import { supabase } from './db';
import { bot } from './index';
import { DateTime } from 'luxon';
import { claimButtons, temuButton } from './services/keyboards';
import { MESSAGES } from './constants';

export const scheduleJobs = () => {
  cron.schedule('* * * * *', async () => {
    const now = DateTime.utc().toISO();
    const { data: due, error: dueError } = await supabase
      .from('notifications')
      .select('*')
      .eq('sent_time_utc', null)
      .eq('is_clicked', false)
      .lte('notification_time_utc', now);

    if (dueError || !due || due.length === 0) return;

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
            reply_markup: temuButton.reply_markup,
          });
        }

        await supabase
          .from('notifications')
          .update({ sent_time_utc: now })
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
