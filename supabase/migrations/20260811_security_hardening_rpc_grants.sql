-- Security hardening: fix check_rate_limit (cross-user DoS) and lock down audit/security-log RPCs
-- Applied live  2026-08-11.

-- 1) check_rate_limit was SECURITY DEFINER + PUBLIC-EXECUTABLE and accepted an arbitrary
--    p_user_id, so any caller could inflate another user's rate counter (DoS).
--    Now forces p_user_id to the authenticated caller.
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id uuid,
  p_ip_address inet,
  p_endpoint text,
  p_max_requests integer DEFAULT 100,
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMPTZ;
  v_max INT;
  v_window INT;
BEGIN
  IF p_endpoint IS NULL OR length(p_endpoint) > 256 THEN
    RETURN false;
  END IF;
  v_max := GREATEST(1, LEAST(coalesce(p_max_requests, 100), 10000));
  v_window := GREATEST(1, LEAST(coalesce(p_window_minutes, 60), 1440));
  v_window_start := DATE_TRUNC('minute', NOW()) - (v_window || ' minutes')::INTERVAL;

  DELETE FROM public.rate_limits WHERE window_start < v_window_start;

  -- Only allow the caller to rate-limit themselves, never another user id.
  IF auth.uid() IS NULL THEN
    p_user_id := NULL;
  ELSE
    p_user_id := auth.uid();
  END IF;

  IF p_user_id IS NOT NULL THEN
    SELECT COALESCE(SUM(request_count), 0) INTO v_count
    FROM public.rate_limits
    WHERE user_id = p_user_id AND endpoint = p_endpoint AND window_start >= v_window_start;
    IF v_count >= v_max THEN RETURN FALSE; END IF;
    INSERT INTO public.rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, DATE_TRUNC('minute', NOW()))
    ON CONFLICT (user_id, endpoint, window_start)
    DO UPDATE SET request_count = public.rate_limits.request_count + 1;
  END IF;

  IF p_ip_address IS NOT NULL THEN
    SELECT COALESCE(SUM(request_count), 0) INTO v_count
    FROM public.rate_limits
    WHERE ip_address = p_ip_address AND endpoint = p_endpoint AND window_start >= v_window_start;
    IF v_count >= (v_max * 2) THEN RETURN FALSE; END IF;
    INSERT INTO public.rate_limits (ip_address, endpoint, request_count, window_start)
    VALUES (p_ip_address, p_endpoint, 1, DATE_TRUNC('minute', NOW()))
    ON CONFLICT (ip_address, endpoint, window_start)
    DO UPDATE SET request_count = public.rate_limits.request_count + 1;
  END IF;

  RETURN TRUE;
END;
$function$;

-- 2) Audit-log RPCs must not be callable by unauthenticated users (avoids audit forgery + table spam).
REVOKE EXECUTE ON FUNCTION public.secure_insert_audit_log(uuid, text, text, uuid, jsonb, jsonb, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.secure_insert_audit_log(uuid, text, text, uuid, jsonb, jsonb, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.secure_insert_audit_log(uuid, text, text, uuid, jsonb, jsonb, text) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.log_security_event(text, uuid, inet, text, text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_security_event(text, uuid, inet, text, text, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.log_security_event(text, uuid, inet, text, text, jsonb) TO authenticated, service_role;

-- 3) check_rate_limit: same treatment (client callers fail open, so anonymous pages are unaffected).
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(uuid, inet, text, integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(uuid, inet, text, integer, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(uuid, inet, text, integer, integer) TO authenticated, service_role;