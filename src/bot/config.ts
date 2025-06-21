import { Telegraf, session, Scenes } from 'telegraf';
import { TELEGRAM_TOKEN } from '../config';
import { MyContext } from '../types';
import { startSession, statusHandler, cancelHandler } from '../handlers';
import { handleClaimAction, handleDeleteSessionAction } from './actions';
import {
  COMMANDS,
  SCENE_IDS,
  CALLBACK_PREFIXES,
  UI_MESSAGES,
  SYSTEM_ERROR_MESSAGES,
  ACTION_NAMES,
} from '../constants';

export const bot = new Telegraf<MyContext>(TELEGRAM_TOKEN);
const stage = new Scenes.Stage<MyContext>([startSession]);

export const initializeBot = (): void => {
  bot.use(session());
  bot.use(stage.middleware());

  bot.start(ctx => ctx.reply(UI_MESSAGES.WELCOME));
  bot.command(COMMANDS.HELP, ctx => ctx.reply(UI_MESSAGES.HELP_MESSAGE));
  bot.command(COMMANDS.START_SESSION, ctx => ctx.scene.enter(SCENE_IDS.START_SESSION));
  bot.command(COMMANDS.STATUS, statusHandler);
  bot.command(COMMANDS.CANCEL_SESSION, cancelHandler);

  bot.action(ACTION_NAMES.CANCEL_SESSION, cancelHandler);
  bot.action(new RegExp(`^${CALLBACK_PREFIXES.CLAIM}`), handleClaimAction);
  bot.action(new RegExp(`^${CALLBACK_PREFIXES.DELETE_SESSION}`), handleDeleteSessionAction);

  bot.catch(error => {
    console.error(SYSTEM_ERROR_MESSAGES.GLOBAL_BOT_ERROR, error);
  });
};
