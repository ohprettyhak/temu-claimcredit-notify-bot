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

bot.start(ctx => {
  ctx.reply(MESSAGES.WELCOME, { parse_mode: 'HTML' });
});

bot.command(COMMANDS.HELP, ctx => {
  ctx.reply(MESSAGES.HELP, { parse_mode: 'HTML' });
});

bot.command(COMMANDS.START_SESSION, ctx => ctx.scene.enter('startSession'));
bot.command(COMMANDS.STATUS, statusHandler);
bot.command(COMMANDS.CANCEL_SESSION, cancelHandler);

bot.action(/CLAIM_(.+)/, async ctx => {
  const notificationId = ctx.match[1];
  const { data: notif, error } = await supabase
    .from('notifications')
    .select('session_id,notification_date')
    .eq('notification_id', notificationId)
    .single();

  if (error || !notif) {
    return ctx.answerCbQuery(MESSAGES.NOTIFICATION_NOT_FOUND);
  }

  await supabase
    .from('notifications')
    .update({ is_clicked: true })
    .or(
      `notification_id.eq.${notificationId},session_id.eq.${notif.session_id}.notification_date.eq.${notif.notification_date}.notification_type.eq.evening`,
    );
  await ctx.answerCbQuery(MESSAGES.MARKED_AS_CLAIMED);
});

bot.action(/CANCEL_(.+)/, async ctx => {
  const sessionIdStr = ctx.match[1];
  const sessionId = parseInt(sessionIdStr, 10);

  if (isNaN(sessionId)) {
    return ctx.answerCbQuery(MESSAGES.INVALID_SESSION_ID);
  }

  await supabase.from('notifications').delete().eq('session_id', sessionId);
  await supabase.from('sessions').delete().eq('session_id', sessionId);
  await ctx.editMessageText(MESSAGES.SESSION_CANCELLED_SUCCESS);
});

scheduleJobs();
bot.launch().then(() => {
  console.log(MESSAGES.BOT_RUNNING);
});
