CREATE TABLE public.sessions (
    session_id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    user_id BIGINT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    morning_notification_time TEXT NOT NULL,
    evening_notification_time TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_dates ON public.sessions(start_date, end_date);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access on sessions" ON public.sessions
    FOR ALL USING (auth.role() = 'service_role');

GRANT ALL ON public.sessions TO authenticated, anon, service_role; 