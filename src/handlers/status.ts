import { MyContext } from '../types';
import { supabase } from '../db';
import { DateTime } from 'luxon';
import { MESSAGES } from '../constants';

const statusHandler = async (ctx: MyContext): Promise<void> => {
  try {
    const userId = ctx.from!.id;
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('timezone')
      .eq('user_id', userId)
      .single();

    if (userError) {
      await ctx.reply(MESSAGES.USER_INFO_FAILED);
      return;
    }

    const tz = user?.timezone || 'UTC';
    const today = DateTime.utc().setZone(tz).toISODate()!;
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId);

    if (sessionsError) {
      await ctx.reply(MESSAGES.SESSIONS_FETCH_FAILED);
      return;
    }

    if (!sessions || sessions.length === 0) {
      await ctx.reply(MESSAGES.NO_ACTIVE_SESSIONS);
      return;
    }

    let msg = MESSAGES.ACTIVE_SESSIONS + '\n';
    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      const day =
        DateTime.fromISO(today).diff(DateTime.fromISO(session.start_date), 'days').days + 1;
      const { data: notif } = await supabase
        .from('notifications')
        .select('is_clicked')
        .eq('session_id', session.session_id)
        .eq('notification_date', today)
        .eq('notification_type', 'morning')
        .single();

      msg += `• #${i + 1} (${session.start_date}~${session.end_date}) — ${Math.floor(day)}일차/7일 — 수령: ${notif?.is_clicked ? '✅' : '❌'}\n`;
    }

    await ctx.reply(msg);
  } catch (error) {
    await ctx.reply(MESSAGES.STATUS_ERROR);
  }
};

export default statusHandler;
