import { Context, Scenes } from 'telegraf';

export interface SessionState extends Scenes.WizardSessionData {
  timezone?: string;
  morningTime?: string;
  eveningTime?: string;
  startDate?: string;
  formMessageId?: number;
}

export interface MyContext extends Context {
  scene: Scenes.SceneContextScene<MyContext, SessionState> & {
    state: SessionState;
  };
  wizard: Scenes.WizardContextWizard<MyContext>;
}

export interface DatabaseSession {
  session_id: string;
  user_id: number;
  start_date: string;
  end_date: string;
  morning_notification_time: string;
  evening_notification_time: string;
  created_at: string;
}

export interface NotificationViewData {
  notification_id: string;
  session_id: string;
  notification_type: string;
  year: number;
  month: number;
  day: number;
  hour: number;
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
