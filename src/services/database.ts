import { supabase } from '../db';
import {
  DatabaseSession,
  DatabaseUser,
  UserInput,
  SessionInput,
  NotificationInput,
  NotificationType,
} from '../types';
import { UI_MESSAGES } from '../constants';

export const getUserSessions = async (userId: number): Promise<DatabaseSession[]> => {
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error(UI_MESSAGES.FAILED_TO_FETCH_SESSIONS);
  }

  return sessions || [];
};

export const getNotificationStatus = async (
  sessionId: string,
  date: string,
  notificationType: NotificationType,
): Promise<boolean> => {
  const { data: notification } = await supabase
    .from('notifications')
    .select('is_clicked')
    .eq('session_id', sessionId)
    .eq('notification_date', date)
    .eq('notification_type', notificationType)
    .single();

  return notification?.is_clicked || false;
};

export const updateNotificationSentTime = async (
  notificationId: string,
  sentTime: string,
): Promise<void> => {
  await supabase
    .from('notifications')
    .update({ sent_time_utc: sentTime })
    .eq('notification_id', notificationId);
};

export const createUser = async (userInput: UserInput): Promise<DatabaseUser> => {
  const { data: user, error } = await supabase.from('users').upsert(userInput).select().single();

  if (error || !user) {
    throw new Error('Failed to create user');
  }

  return user;
};

export const createSession = async (sessionData: SessionInput): Promise<DatabaseSession> => {
  const { data: session, error } = await supabase
    .from('sessions')
    .insert(sessionData)
    .select()
    .single();

  if (error || !session) {
    throw new Error(UI_MESSAGES.SESSION_CREATION_FAILED);
  }

  return session;
};

export const createNotifications = async (notifications: NotificationInput[]): Promise<void> => {
  const { error } = await supabase.from('notifications').insert(notifications);

  if (error) {
    throw error;
  }
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  await supabase.from('notifications').delete().eq('session_id', sessionId);
  await supabase.from('sessions').delete().eq('session_id', sessionId);
};

export const markNotificationClaimed = async (notificationId: string): Promise<void> => {
  await supabase
    .from('notifications')
    .update({ is_clicked: true })
    .eq('notification_id', notificationId);
};
