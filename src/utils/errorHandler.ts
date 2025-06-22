import { UI_MESSAGES, SYSTEM_ERROR_MESSAGES } from '../constants';
import { MyContext } from '../types';

type AsyncHandler<T = void> = (ctx: MyContext) => Promise<T>;

export const withErrorHandling = <T = void>(
  handler: AsyncHandler<T>,
  customErrorMessage?: string,
): AsyncHandler<T> => {
  return async (ctx: MyContext): Promise<T> => {
    try {
      return await handler(ctx);
    } catch (error) {
      console.error(customErrorMessage || SYSTEM_ERROR_MESSAGES.GLOBAL_BOT_ERROR, error);

      if (ctx.callbackQuery) {
        await ctx.answerCbQuery(UI_MESSAGES.PROCESSING_ERROR);
      } else {
        await ctx.reply(UI_MESSAGES.PROCESSING_ERROR);
      }

      throw error;
    }
  };
};

export const withCallbackValidation = (handler: AsyncHandler): AsyncHandler => {
  return async (ctx: MyContext): Promise<void> => {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
      await ctx.answerCbQuery(UI_MESSAGES.PROCESSING_ERROR);
      return;
    }

    return handler(ctx);
  };
};

export const withUserValidation = (handler: AsyncHandler): AsyncHandler => {
  return async (ctx: MyContext): Promise<void> => {
    if (!ctx.from) {
      await ctx.reply(UI_MESSAGES.PROCESSING_ERROR);
      return;
    }

    return handler(ctx);
  };
};
