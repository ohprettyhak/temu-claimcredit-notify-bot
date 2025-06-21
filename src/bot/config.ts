import { Telegraf, session, Scenes } from 'telegraf';
import { TELEGRAM_TOKEN } from '../config';
import { MyContext } from '../types';
import { startSession, statusHandler, cancelHandler } from '../handlers';
import { handleClaimAction, handleDeleteSessionAction } from './actions';
import { COMMANDS, MESSAGES, ERROR_MESSAGES, ACTION_NAMES } from '../constants';

export const bot = new Telegraf<MyContext>(TELEGRAM_TOKEN);
const stage = new Scenes.Stage<MyContext>([startSession]);

export const initializeBot = (): void => {
  bot.use(session());
  bot.use(stage.middleware());

  bot.start(ctx => ctx.reply(MESSAGES.WELCOME));
  bot.command(COMMANDS.HELP, ctx => ctx.reply(MESSAGES.HELP_MESSAGE));
  bot.command(COMMANDS.START_SESSION, ctx => ctx.scene.enter('start_session'));
  bot.command(COMMANDS.STATUS, statusHandler);
  bot.command(COMMANDS.CANCEL_SESSION, cancelHandler);

  bot.action(ACTION_NAMES.CANCEL_SESSION, cancelHandler);
  bot.action(/^claim_/, handleClaimAction);
  bot.action(/^delete_session_/, handleDeleteSessionAction);

  bot.catch(error => {
    console.error(ERROR_MESSAGES.GLOBAL_BOT_ERROR, error);
  });
};
