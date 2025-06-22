CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.users (
    user_id BIGINT PRIMARY KEY,
    timezone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access on users" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

GRANT ALL ON public.users TO authenticated, anon, service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon, service_role; 