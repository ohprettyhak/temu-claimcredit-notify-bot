CREATE TABLE public.notifications (
    notification_id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    session_id TEXT NOT NULL REFERENCES public.sessions(session_id) ON DELETE CASCADE,
    notification_date TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('morning', 'evening')),
    notification_time_utc TEXT NOT NULL,
    is_clicked BOOLEAN DEFAULT FALSE,
    sent_time_utc TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_session_id ON public.notifications(session_id);
CREATE INDEX idx_notifications_time_sent ON public.notifications(notification_time_utc, sent_time_utc);
CREATE INDEX idx_notifications_status ON public.notifications(session_id, notification_date, notification_type);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access on notifications" ON public.notifications
    FOR ALL USING (auth.role() = 'service_role');

GRANT ALL ON public.notifications TO authenticated, anon, service_role; 