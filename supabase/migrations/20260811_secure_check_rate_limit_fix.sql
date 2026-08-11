-- Fix secure_check_rate_limit to match the actual rate_limits schema
-- The old version referenced identifier/action/count columns that don't exist
-- on public.rate_limits (which uses user_id/ip_address/endpoint/request_count).
-- Applied live via Management API on 2026-08-11.

CREATE OR REPLACE FUNCTION public.secure_check_rate_limit(
  p_identifier text,
  p_action text,
  p_max_requests integer DEFAULT 50,
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_count int;
  v_window_start timestamptz;
  v_max int;
  v_window int;
  v_key text;
BEGIN
  IF p_identifier IS NULL OR length(p_identifier) NOT BETWEEN 1 AND 256
     OR p_action IS NULL OR length(p_action) NOT BETWEEN 1 AND 128 THEN
    RETURN false;
  END IF;
  v_max := GREATEST(1, LEAST(coalesce(p_max_requests, 50), 10000));
  v_window := GREATEST(1, LEAST(coalesce(p_window_minutes, 60), 1440));
  v_window_start := now() - (v_window || ' minutes')::interval;
  v_key := left(p_identifier, 256) || ':' || left(p_action, 128);

  SELECT count(*) INTO v_count
  FROM public.rate_limits
  WHERE endpoint = v_key AND window_start > v_window_start;

  IF v_count >= v_max THEN
    RETURN false;
  END IF;

  INSERT INTO public.rate_limits (endpoint, request_count, window_start)
  VALUES (v_key, 1, now());

  RETURN true;
END;
$function$;

-- Only the rate-limit-check edge function (service_role) should call this.
REVOKE EXECUTE ON FUNCTION public.secure_check_rate_limit(text, text, integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.secure_check_rate_limit(text, text, integer, integer) TO service_role;