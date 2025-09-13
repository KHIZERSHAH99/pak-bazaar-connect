-- Drop and recreate problematic views as security invoker
-- These views were created with implicit security definer which is causing the linter warnings

-- 1) Drop and recreate profiles_public view with explicit SECURITY INVOKER
DROP VIEW IF EXISTS public.profiles_public CASCADE;

CREATE OR REPLACE VIEW public.profiles_public
WITH (security_barrier = true, security_invoker = true)
AS
SELECT 
  id,
  business_name,
  business_type,
  city,
  verification_status,
  created_at,
  role
FROM public.profiles
WHERE is_suspended = false;

-- 2) Drop and recreate security_metrics view with explicit SECURITY INVOKER
DROP VIEW IF EXISTS public.security_metrics CASCADE;

CREATE OR REPLACE VIEW public.security_metrics
WITH (security_barrier = true, security_invoker = true)
AS
SELECT 
  'failed_login_attempts'::text AS metric,
  count(*) AS value,
  now() AS measured_at
FROM public.audit_logs
WHERE event_type = 'login_failed' 
  AND created_at > (now() - '01:00:00'::interval)
UNION ALL
SELECT 
  'suspicious_activities'::text AS metric,
  count(*) AS value,
  now() AS measured_at
FROM public.audit_logs
WHERE event_type = ANY (ARRAY['suspicious_role_switching'::text, 'suspicious_access_pattern'::text, 'unauthorized_admin_attempt'::text]) 
  AND created_at > (now() - '24:00:00'::interval)
UNION ALL
SELECT 
  'rate_limit_violations'::text AS metric,
  count(*) AS value,
  now() AS measured_at
FROM public.audit_logs
WHERE event_type = 'rate_limit_exceeded' 
  AND created_at > (now() - '01:00:00'::interval);

-- 3) Log the security fix
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  table_name,
  new_values
) VALUES (
  NULL,
  'security_views_fixed',
  'views',
  jsonb_build_object(
    'action', 'converted_views_to_security_invoker',
    'fixed_views', ARRAY['profiles_public', 'security_metrics'],
    'applied_at', NOW()
  )
);