import { supabase } from '../db';
import { DatabaseSession } from '../types';
import { MESSAGES } from '../constants';

export const getUserSessions = async (userId: number): Promise<DatabaseSession[]> => {
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error(MESSAGES.FAILED_TO_FETCH_SESSIONS);
  }

  return sessions || [];
};

export const getNotificationStatus = async (
  sessionId: string,
  date: string,
  notificationType: string,
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

export const getSessionUser = async (sessionId: string): Promise<number> => {
  const { data: session, error } = await supabase
    .from('sessions')
    .select('user_id')
    .eq('session_id', sessionId)
    .single();

  if (error || !session) {
    throw new Error(MESSAGES.SESSION_NOT_FOUND);
  }

  return session.user_id;
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

export const createUser = async (userId: number, timezone: string): Promise<void> => {
  await supabase.from('users').upsert({ user_id: userId, timezone });
};

export const createSession = async (sessionData: {
  user_id: number;
  start_date: string;
  end_date: string;
  morning_notification_time: string;
  evening_notification_time: string;
}): Promise<DatabaseSession> => {
  const { data: session, error } = await supabase
    .from('sessions')
    .insert(sessionData)
    .select()
    .single();

  if (error || !session) {
    throw new Error(MESSAGES.SESSION_CREATION_FAILED);
  }

  return session;
};

export const createNotifications = async (
  notifications: Array<{
    session_id: string;
    notification_date: string;
    notification_type: string;
    notification_time_utc: string;
    is_clicked: boolean;
  }>,
): Promise<void> => {
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
