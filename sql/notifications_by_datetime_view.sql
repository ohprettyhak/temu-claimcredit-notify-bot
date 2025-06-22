CREATE VIEW public.notifications_by_datetime_view AS
SELECT 
    n.notification_id,
    n.session_id,
    s.user_id,
    n.notification_type,
    EXTRACT(YEAR FROM n.notification_time_utc::timestamp)::numeric AS year,
    EXTRACT(MONTH FROM n.notification_time_utc::timestamp)::numeric AS month,
    EXTRACT(DAY FROM n.notification_time_utc::timestamp)::numeric AS day,
    EXTRACT(HOUR FROM n.notification_time_utc::timestamp)::numeric AS hour,
    n.notification_time_utc::timestamp with time zone AS notification_time_utc,
    n.notification_date,
    n.is_clicked,
    n.sent_time_utc,
    n.created_at
FROM public.notifications n
INNER JOIN public.sessions s ON n.session_id = s.session_id
WHERE n.sent_time_utc IS NULL  
  AND n.notification_time_utc::timestamp >= NOW() - INTERVAL '24 hour'
  AND n.notification_time_utc::timestamp <= NOW() + INTERVAL '1 hour';

CREATE INDEX IF NOT EXISTS idx_notifications_view_performance 
ON public.notifications(notification_time_utc, sent_time_utc) 
WHERE sent_time_utc IS NULL;

GRANT SELECT ON public.notifications_by_datetime_view TO authenticated, anon, service_role; 