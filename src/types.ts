import { Context, Scenes } from 'telegraf';

// ===== Telegram API Types =====
export interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_bot?: boolean;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  edit_date?: number;
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
  edited_channel_post?: TelegramMessage;
}

// ===== Application Types =====
export interface SessionState extends Scenes.WizardSessionData {
  timezone?: string;
  morningTime?: string;
  eveningTime?: string;
  startDate?: string;
  formMessageId?: number;
  todayClaimStatus?: boolean;
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

export interface NotificationRecord {
  notification_id: string;
  session_id: string;
  notification_date: string;
  notification_type: string;
  notification_time_utc: string;
  is_clicked: boolean;
  sent_time_utc?: string;
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

export interface SessionCreationData {
  sessionId: string;
  startDate: string;
  morningTime: string;
  eveningTime: string;
  timezone: string;
  userId: number;
  todayClaimStatus: boolean;
}

// ===== Type Guards =====
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

// ===== Utility Types =====
export type NotificationType = 'morning' | 'evening';
export type TimeType = 'MORN' | 'EVE';
