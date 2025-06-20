import { Telegraf, session, Scenes } from 'telegraf';
import { TELEGRAM_TOKEN } from './config';
import { supabase } from './db';
import { startSession } from './handlers/startSession';
import statusHandler from './handlers/status';
import cancelHandler from './handlers/cancelSession';
import { scheduleJobs } from './scheduler';
import { MyContext } from './types';
import { COMMANDS, MESSAGES } from './constants';

export const bot = new Telegraf<MyContext>(TELEGRAM_TOKEN);
const stage = new Scenes.Stage<MyContext>([startSession]);

bot.use(session());
bot.use(stage.middleware());

bot.telegram.setMyCommands([
  { command: 'start_session', description: MESSAGES.COMMAND_START_SESSION },
  { command: 'status', description: MESSAGES.COMMAND_STATUS },
  { command: 'cancel_session', description: MESSAGES.COMMAND_CANCEL_SESSION },
  { command: 'help', description: MESSAGES.COMMAND_HELP },
]);

bot.start(async ctx => {
  try {
    await ctx.reply(MESSAGES.WELCOME, { parse_mode: 'HTML' });
  } catch (err) {
    console.error(MESSAGES.COMMAND_ERROR('/start'), err);
  }
});

bot.command(COMMANDS.HELP, async ctx => {
  try {
    await ctx.reply(MESSAGES.HELP, { parse_mode: 'HTML' });
  } catch (err) {
    console.error(MESSAGES.COMMAND_ERROR('/help'), err);
  }
});

bot.command(COMMANDS.START_SESSION, async ctx => {
  try {
    await ctx.scene.enter('startSession');
  } catch (err) {
    console.error(MESSAGES.COMMAND_ERROR('/start_session'), err);
  }
});

bot.command(COMMANDS.STATUS, async ctx => {
  try {
    await statusHandler(ctx);
  } catch (err) {
    console.error(MESSAGES.COMMAND_ERROR('/status'), err);
  }
});

bot.command(COMMANDS.CANCEL_SESSION, async ctx => {
  try {
    await cancelHandler(ctx);
  } catch (err) {
    console.error(MESSAGES.COMMAND_ERROR('/cancel_session'), err);
  }
});

bot.action(/CLAIM_(.+)/, async ctx => {
  try {
    const notificationId = ctx.match[1];
    const { data: notification, error } = await supabase
      .from('notifications')
      .select('session_id,notification_date')
      .eq('notification_id', notificationId)
      .single();

    if (error || !notification) {
      return ctx.answerCbQuery(MESSAGES.NOTIFICATION_NOT_FOUND);
    }

    await supabase
      .from('notifications')
      .update({ is_clicked: true })
      .eq('notification_id', notificationId);

    await ctx.answerCbQuery(MESSAGES.MARKED_AS_CLAIMED);
  } catch (err) {
    console.error(MESSAGES.ACTION_ERROR('수령 완료'), err);
    await ctx.answerCbQuery(MESSAGES.PROCESSING_ERROR);
  }
});

bot.action(/CANCEL_(.+)/, async ctx => {
  try {
    const sessionId = ctx.match[1];

    await supabase.from('notifications').delete().eq('session_id', sessionId);
    await supabase.from('sessions').delete().eq('session_id', sessionId);

    await ctx.editMessageText(MESSAGES.SESSION_CANCELLED_SUCCESS);
  } catch (err) {
    console.error(MESSAGES.ACTION_ERROR('세션 취소'), err);
    await ctx.answerCbQuery(MESSAGES.PROCESSING_ERROR);
  }
});

bot.catch(err => {
  console.error(MESSAGES.GLOBAL_BOT_ERROR, err);
});

scheduleJobs();

bot.launch().then(() => {
  console.log(MESSAGES.BOT_RUNNING);
});
