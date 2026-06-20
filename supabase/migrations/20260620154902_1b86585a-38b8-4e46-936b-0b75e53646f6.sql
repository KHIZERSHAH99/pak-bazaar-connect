
-- ============================================================
-- DROP unused dangerous RPC
-- ============================================================
DROP FUNCTION IF EXISTS public.get_available_phones();

-- ============================================================
-- Bucket A: Anon-callable pre-auth flows — add validation + rate limits
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_phone_exists(p_phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_normalized text;
BEGIN
  IF p_phone IS NULL OR length(p_phone) > 20 OR length(p_phone) < 7 THEN
    RETURN false;
  END IF;
  -- Allow only digits, +, spaces, dashes
  IF p_phone !~ '^[+0-9 \-]+$' THEN
    RETURN false;
  END IF;
  -- Rate-limit per caller/IP via shared helper (silently deny under abuse)
  IF NOT public.check_operation_rate_limit('check_phone_exists', 20, 5) THEN
    RETURN false;
  END IF;

  v_normalized := public.normalize_pakistani_phone(p_phone);

  RETURN EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.phone_number = p_phone
       OR p.phone_number = v_normalized
       OR p.normalized_phone = v_normalized
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_user_exists(p_email text DEFAULT NULL, p_phone text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  email_exists boolean := false;
  phone_exists boolean := false;
BEGIN
  IF p_email IS NULL AND p_phone IS NULL THEN
    RETURN jsonb_build_object('email_exists', false, 'phone_exists', false);
  END IF;
  IF coalesce(length(p_email), 0) > 255 OR coalesce(length(p_phone), 0) > 20 THEN
    RETURN jsonb_build_object('email_exists', false, 'phone_exists', false);
  END IF;
  IF p_email IS NOT NULL AND p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    p_email := NULL;
  END IF;
  IF p_phone IS NOT NULL AND p_phone !~ '^[+0-9 \-]+$' THEN
    p_phone := NULL;
  END IF;
  IF NOT public.check_operation_rate_limit('check_user_exists', 20, 5) THEN
    RETURN jsonb_build_object('email_exists', false, 'phone_exists', false);
  END IF;

  IF p_email IS NOT NULL THEN
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE lower(email) = lower(p_email)) INTO email_exists;
  END IF;
  IF p_phone IS NOT NULL THEN
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE phone_number = p_phone) INTO phone_exists;
  END IF;

  RETURN jsonb_build_object('email_exists', email_exists, 'phone_exists', phone_exists);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_by_phone(phone_input text)
RETURNS TABLE(user_email text, user_role text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_normalized text;
BEGIN
  IF phone_input IS NULL OR length(phone_input) > 20 OR length(phone_input) < 7 THEN
    RETURN;
  END IF;
  IF phone_input !~ '^[+0-9 \-]+$' THEN
    RETURN;
  END IF;
  IF NOT public.check_operation_rate_limit('get_user_by_phone', 20, 5) THEN
    RETURN;
  END IF;

  v_normalized := public.normalize_pakistani_phone(phone_input);

  RETURN QUERY
  SELECT p.email, p.role::text
  FROM public.profiles p
  WHERE p.normalized_phone = v_normalized
     OR p.phone_number = v_normalized
  LIMIT 1;
END;
$function$;

-- ============================================================
-- Bucket B/C: Track/analytics — validate caller and payload size
-- ============================================================

CREATE OR REPLACE FUNCTION public.track_product_view(
  p_product_id uuid,
  p_session_id text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_referrer text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF p_product_id IS NULL THEN RETURN; END IF;
  IF coalesce(length(p_session_id), 0) > 128
     OR coalesce(length(p_user_agent), 0) > 512
     OR coalesce(length(p_referrer), 0) > 2048 THEN
    RETURN;
  END IF;
  -- Lightweight abuse cap (60/min per caller)
  IF NOT public.check_operation_rate_limit('track_product_view', 60, 1) THEN
    RETURN;
  END IF;

  INSERT INTO public.product_views (product_id, user_id, session_id, user_agent, referrer)
  VALUES (p_product_id, auth.uid(), p_session_id, p_user_agent, p_referrer);
END;
$function$;

CREATE OR REPLACE FUNCTION public.secure_insert_analytics_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_page_url text DEFAULT NULL,
  p_referrer text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_event_data jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  new_id uuid;
  v_effective_user uuid;
BEGIN
  IF p_event_type IS NULL OR length(p_event_type) > 128 THEN
    RAISE EXCEPTION 'invalid event_type' USING ERRCODE = '22023';
  END IF;
  IF coalesce(length(p_session_id), 0) > 128
     OR coalesce(length(p_page_url), 0) > 2048
     OR coalesce(length(p_referrer), 0) > 2048
     OR coalesce(length(p_user_agent), 0) > 512
     OR coalesce(octet_length(p_event_data::text), 0) > 4096 THEN
    RAISE EXCEPTION 'payload too large' USING ERRCODE = '22023';
  END IF;
  IF NOT public.check_operation_rate_limit('analytics_event', 120, 1) THEN
    RAISE EXCEPTION 'rate_limited' USING ERRCODE = '42501';
  END IF;

  v_effective_user := COALESCE(auth.uid(), p_user_id);

  INSERT INTO public.analytics_events (event_type, user_id, session_id, page_url, referrer, user_agent, event_data, ip_address)
  VALUES (p_event_type, v_effective_user, p_session_id, p_page_url, p_referrer, p_user_agent, p_event_data, '0.0.0.0'::inet)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$function$;

-- ============================================================
-- Shipping calc — validate ranges
-- ============================================================

CREATE OR REPLACE FUNCTION public.calculate_shipping_cost(
  p_shop_id uuid,
  p_order_amount numeric,
  p_buyer_city text DEFAULT NULL,
  p_total_weight numeric DEFAULT 0,
  p_is_express boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  config RECORD;
  shipping_cost NUMERIC := 0;
  delivery_days INTEGER := 3;
  method TEXT;
BEGIN
  IF p_shop_id IS NULL THEN
    RAISE EXCEPTION 'shop_id required' USING ERRCODE = '22023';
  END IF;
  IF p_order_amount IS NULL OR p_order_amount < 0 OR p_order_amount > 100000000 THEN
    RAISE EXCEPTION 'invalid order_amount' USING ERRCODE = '22023';
  END IF;
  IF p_total_weight < 0 OR p_total_weight > 100000 THEN
    RAISE EXCEPTION 'invalid weight' USING ERRCODE = '22023';
  END IF;
  IF coalesce(length(p_buyer_city), 0) > 128 THEN
    RAISE EXCEPTION 'invalid city' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO config FROM public.shipping_configs
   WHERE shop_id = p_shop_id AND is_active = true LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('cost', 150, 'method', 'default', 'delivery_days', 3, 'message', 'Standard shipping');
  END IF;

  IF p_is_express AND config.express_shipping_available THEN
    RETURN jsonb_build_object('cost', COALESCE(config.express_shipping_cost, 300), 'method', 'express',
      'delivery_days', COALESCE(config.express_delivery_days, 1), 'message', 'Express delivery');
  END IF;

  IF config.free_shipping_above IS NOT NULL AND p_order_amount >= config.free_shipping_above THEN
    RETURN jsonb_build_object('cost', 0, 'method', 'free', 'delivery_days', config.estimated_delivery_days,
      'message', 'FREE SHIPPING! (Order above Rs. ' || config.free_shipping_above || ')');
  END IF;

  CASE config.shipping_method
    WHEN 'flat_rate' THEN shipping_cost := COALESCE(config.flat_rate_cost, 150); method := 'flat_rate';
    WHEN 'weight_based' THEN
      IF p_total_weight > 0 THEN
        shipping_cost := COALESCE(config.base_weight_rate, 50) + (p_total_weight * COALESCE(config.additional_weight_rate, 20));
      ELSE shipping_cost := COALESCE(config.flat_rate_cost, 150); END IF;
      method := 'weight_based';
    WHEN 'city_based' THEN
      IF p_buyer_city IS NOT NULL AND config.city_rates IS NOT NULL THEN
        shipping_cost := COALESCE((config.city_rates->p_buyer_city)::NUMERIC, COALESCE(config.flat_rate_cost, 150));
      ELSE shipping_cost := COALESCE(config.flat_rate_cost, 150); END IF;
      method := 'city_based';
    ELSE shipping_cost := COALESCE(config.flat_rate_cost, 150); method := 'flat_rate';
  END CASE;

  RETURN jsonb_build_object('cost', shipping_cost, 'method', method,
    'delivery_days', config.estimated_delivery_days, 'message', 'Shipping via ' || method);
END;
$function$;

-- ============================================================
-- Rate-limit helpers — clamp inputs
-- ============================================================

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
BEGIN
  IF p_identifier IS NULL OR length(p_identifier) > 256
     OR p_action IS NULL OR length(p_action) > 128 THEN
    RETURN false;
  END IF;
  v_max := GREATEST(1, LEAST(coalesce(p_max_requests, 50), 10000));
  v_window := GREATEST(1, LEAST(coalesce(p_window_minutes, 60), 1440));
  v_window_start := now() - (v_window || ' minutes')::interval;

  SELECT count INTO v_count FROM public.rate_limits
  WHERE identifier = p_identifier AND action = p_action AND window_start > v_window_start;

  IF v_count IS NULL THEN
    INSERT INTO public.rate_limits (identifier, action, count, window_start)
    VALUES (p_identifier, p_action, 1, now());
    RETURN true;
  ELSIF v_count >= v_max THEN
    RETURN false;
  ELSE
    UPDATE public.rate_limits SET count = count + 1
    WHERE identifier = p_identifier AND action = p_action AND window_start > v_window_start;
    RETURN true;
  END IF;
END;
$function$;

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

-- ============================================================
-- get_public_profile_info — validate input + fix admin-log guard
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_public_profile_info(profile_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  result jsonb;
  v_caller uuid := auth.uid();
  v_is_admin boolean := false;
BEGIN
  IF profile_id IS NULL THEN
    RETURN '{}'::jsonb;
  END IF;

  IF v_caller IS NOT NULL THEN
    v_is_admin := EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_caller AND role = 'admin'::public.app_role);
  END IF;

  -- Own profile: full data
  IF v_caller = profile_id THEN
    SELECT to_jsonb(p.*) INTO result FROM public.profiles p WHERE p.id = profile_id;
    RETURN COALESCE(result, '{}'::jsonb);
  END IF;

  -- Public-safe snapshot for everyone else
  SELECT jsonb_build_object(
    'id', p.id,
    'business_name', p.business_name,
    'city', p.city,
    'role', p.role,
    'verification_status', p.verification_status
  ) INTO result
  FROM public.profiles p WHERE p.id = profile_id;

  IF v_is_admin THEN
    INSERT INTO public.audit_logs (user_id, event_type, table_name, record_id, new_values)
    VALUES (v_caller, 'admin_viewed_profile', 'profiles', profile_id,
            jsonb_build_object('viewed_at', NOW()));
  END IF;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$function$;
