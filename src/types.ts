import { Context, Scenes } from 'telegraf';

export interface SessionState extends Scenes.WizardSessionData {
  timezone?: string;
  morningTime?: string;
  eveningTime?: string;
  startDate?: string;
}

export interface MyContext extends Context {
  scene: Scenes.SceneContextScene<MyContext, SessionState> & {
    state: SessionState;
  };
  wizard: Scenes.WizardContextWizard<MyContext>;
}

export const hasCallbackData = (
  ctx: MyContext,
): ctx is MyContext & { callbackQuery: { data: string } } => {
  return !!(ctx.callbackQuery && 'data' in ctx.callbackQuery);
};

export const hasMessageText = (
  ctx: MyContext,
): ctx is MyContext & { message: { text: string } } => {
  return !!(ctx.message && 'text' in ctx.message);
};
