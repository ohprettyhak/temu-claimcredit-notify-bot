import { MyContext } from '../types';
import { supabase } from '../db';
import { Markup } from 'telegraf';
import { MESSAGES, BUTTON_TEXT } from '../constants';

const cancelSession = async (ctx: MyContext): Promise<void> => {
  try {
    const userId = ctx.from!.id;
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId);

    if (sessionsError) {
      console.error(MESSAGES.SESSIONS_FETCH_ERROR, sessionsError);
      await ctx.reply(MESSAGES.SESSIONS_FETCH_FAILED);
      return;
    }

    if (!sessions || sessions.length === 0) {
      await ctx.reply(MESSAGES.NO_SESSIONS_TO_CANCEL);
      return;
    }

    const buttons = sessions.map((s, i) =>
      Markup.button.callback(`${BUTTON_TEXT.SESSION_PREFIX}${i + 1}`, `CANCEL_${s.session_id}`),
    );

    await ctx.reply(MESSAGES.SELECT_SESSION_TO_CANCEL, Markup.inlineKeyboard(buttons));
  } catch (error) {
    console.error(MESSAGES.CANCEL_SESSION_ERROR, error);
    await ctx.reply(MESSAGES.SESSION_CANCEL_ERROR);
  }
};

export default cancelSession;
