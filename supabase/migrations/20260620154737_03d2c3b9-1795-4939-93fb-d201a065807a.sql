
-- ============================================================
-- Bucket D: Admin-only RPCs — revoke from anon/authenticated
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.run_all_cleanups() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_storage_stats() FROM anon, authenticated, PUBLIC;

CREATE OR REPLACE FUNCTION public.run_all_cleanups()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF auth.role() <> 'service_role' AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  RETURN jsonb_build_object(
    'notifications', public.cleanup_old_notifications(),
    'sessions', public.cleanup_expired_sessions(),
    'analytics', public.cleanup_old_analytics(),
    'audit_logs', public.cleanup_old_audit_logs(),
    'chat_history', public.cleanup_old_chat_history(),
    'screenshots', public.cleanup_expired_screenshots(),
    'auth_attempts', public.cleanup_old_auth_attempts(),
    'rate_limits', public.cleanup_stale_rate_limits(),
    'security_events', public.cleanup_old_security_events(),
    'cleaned_at', now()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_storage_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF auth.role() <> 'service_role' AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  RETURN jsonb_build_object(
    'total_products', (SELECT count(*) FROM public.products),
    'active_products', (SELECT count(*) FROM public.products WHERE is_active = true),
    'inactive_products', (SELECT count(*) FROM public.products WHERE is_active = false),
    'total_orders', (SELECT count(*) FROM public.orders),
    'total_profiles', (SELECT count(*) FROM public.profiles),
    'total_shops', (SELECT count(*) FROM public.shops),
    'total_notifications', (SELECT count(*) FROM public.notifications),
    'unread_notifications', (SELECT count(*) FROM public.notifications WHERE read_at IS NULL),
    'total_analytics_events', (SELECT count(*) FROM public.analytics_events),
    'total_audit_logs', (SELECT count(*) FROM public.audit_logs),
    'checked_at', now()
  );
END;
$function$;

GRANT EXECUTE ON FUNCTION public.run_all_cleanups() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_storage_stats() TO service_role;

-- ============================================================
-- Bucket C: Authenticated-only RPCs — revoke anon, add guards
-- ============================================================

-- has_role: non-admins can only check their own roles
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_caller uuid := auth.uid();
BEGIN
  -- service_role and triggers bypass the caller check
  IF v_caller IS NULL AND auth.role() <> 'service_role' THEN
    RETURN false;
  END IF;

  -- Non-admin authenticated callers can only ask about themselves
  IF v_caller IS NOT NULL
     AND v_caller <> _user_id
     AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_caller AND role = 'admin'::public.app_role)
  THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$function$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- get_user_role: requires auth
REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated, service_role;

-- switch_business_role: revoke anon (function already validates)
REVOKE EXECUTE ON FUNCTION public.switch_business_role(text) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.switch_business_role(text) TO authenticated, service_role;

-- increment_coupon_usage: require auth + verify caller used the coupon
REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage(uuid) FROM anon, PUBLIC;

CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_caller uuid := auth.uid();
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'auth required' USING ERRCODE = '42501';
  END IF;
  IF coupon_id IS NULL THEN
    RAISE EXCEPTION 'coupon_id required' USING ERRCODE = '22023';
  END IF;
  -- Caller must have an order that actually used this coupon
  IF NOT EXISTS (
    SELECT 1 FROM public.orders
    WHERE buyer_id = v_caller AND coupon_id = increment_coupon_usage.coupon_id
  ) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  UPDATE public.coupons SET used_count = used_count + 1 WHERE id = coupon_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(uuid) TO authenticated, service_role;

-- get_product_analytics: require auth + own the shops
REVOKE EXECUTE ON FUNCTION public.get_product_analytics(uuid[], date) FROM anon, PUBLIC;

CREATE OR REPLACE FUNCTION public.get_product_analytics(p_shop_ids uuid[], p_start_date date DEFAULT (CURRENT_DATE - '30 days'::interval))
RETURNS TABLE(total_views bigint, unique_viewers bigint, views_by_day jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_caller uuid := auth.uid();
  v_is_admin boolean;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'auth required' USING ERRCODE = '42501';
  END IF;
  IF p_shop_ids IS NULL OR array_length(p_shop_ids, 1) IS NULL THEN
    RETURN;
  END IF;
  IF array_length(p_shop_ids, 1) > 100 THEN
    RAISE EXCEPTION 'too many shops' USING ERRCODE = '22023';
  END IF;

  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_caller AND role = 'admin'::public.app_role)
    INTO v_is_admin;

  -- Non-admins must own every shop in the list
  IF NOT v_is_admin AND EXISTS (
    SELECT 1 FROM unnest(p_shop_ids) sid
    WHERE NOT EXISTS (
      SELECT 1 FROM public.shops s WHERE s.id = sid AND s.owner_id = v_caller
    )
  ) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)::bigint,
    COUNT(DISTINCT pv.user_id)::bigint,
    jsonb_agg(jsonb_build_object('date', date_trunc('day', pv.viewed_at), 'views', 1))
  FROM public.product_views pv
  JOIN public.products p ON pv.product_id = p.id
  WHERE p.shop_id = ANY(p_shop_ids)
    AND pv.viewed_at >= p_start_date;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_product_analytics(uuid[], date) TO authenticated, service_role;

-- Payment method getters: require auth (function bodies already validate role)
REVOKE EXECUTE ON FUNCTION public.get_payment_methods_secure(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_secure_payment_methods(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_payment_methods_secure(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_secure_payment_methods(uuid) TO authenticated, service_role;

-- Order details: require auth (function already checks participation)
REVOKE EXECUTE ON FUNCTION public.get_order_details_secure(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_details_secure(uuid) TO authenticated, service_role;

-- ============================================================
-- Audit/security loggers: force caller identity, cap payload
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id uuid,
  p_event_type text,
  p_table_name text DEFAULT NULL,
  p_record_id text DEFAULT NULL,
  p_old_values text DEFAULT NULL,
  p_new_values text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_effective_user uuid;
BEGIN
  -- Block obviously malformed input
  IF p_event_type IS NULL OR length(p_event_type) > 128 THEN
    RAISE EXCEPTION 'invalid event_type' USING ERRCODE = '22023';
  END IF;
  IF coalesce(length(p_table_name), 0) > 128
     OR coalesce(length(p_old_values), 0) > 4096
     OR coalesce(length(p_new_values), 0) > 4096
     OR coalesce(length(p_user_agent), 0) > 512 THEN
    RAISE EXCEPTION 'payload too large' USING ERRCODE = '22023';
  END IF;

  -- If a session exists, ignore caller-supplied p_user_id
  v_effective_user := COALESCE(auth.uid(), p_user_id);

  INSERT INTO public.audit_logs (user_id, event_type, table_name, record_id, old_values, new_values, user_agent)
  VALUES (
    v_effective_user,
    p_event_type,
    p_table_name,
    CASE WHEN p_record_id IS NOT NULL THEN p_record_id::uuid ELSE NULL END,
    CASE WHEN p_old_values IS NOT NULL THEN p_old_values::jsonb ELSE NULL END,
    CASE WHEN p_new_values IS NOT NULL THEN p_new_values::jsonb ELSE NULL END,
    p_user_agent
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to log audit event: %', SQLERRM;
END;
$function$;

CREATE OR REPLACE FUNCTION public.secure_insert_audit_log(
  p_user_id uuid,
  p_event_type text,
  p_table_name text DEFAULT NULL,
  p_record_id uuid DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL,
  p_user_agent text DEFAULT NULL
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
  IF coalesce(length(p_table_name), 0) > 128
     OR coalesce(octet_length(p_old_values::text), 0) > 4096
     OR coalesce(octet_length(p_new_values::text), 0) > 4096
     OR coalesce(length(p_user_agent), 0) > 512 THEN
    RAISE EXCEPTION 'payload too large' USING ERRCODE = '22023';
  END IF;

  v_effective_user := COALESCE(auth.uid(), p_user_id);

  INSERT INTO public.audit_logs (user_id, event_type, table_name, record_id, old_values, new_values, user_agent, ip_address)
  VALUES (v_effective_user, p_event_type, p_table_name, p_record_id, p_old_values, p_new_values, p_user_agent, '0.0.0.0'::inet)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_severity text DEFAULT 'medium',
  p_details jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_event_id uuid;
  v_effective_user uuid;
BEGIN
  IF p_event_type IS NULL OR length(p_event_type) > 128 THEN
    RAISE EXCEPTION 'invalid event_type' USING ERRCODE = '22023';
  END IF;
  IF p_severity NOT IN ('low','medium','high','critical') THEN
    RAISE EXCEPTION 'invalid severity' USING ERRCODE = '22023';
  END IF;
  IF coalesce(length(p_user_agent), 0) > 512
     OR coalesce(octet_length(p_details::text), 0) > 4096 THEN
    RAISE EXCEPTION 'payload too large' USING ERRCODE = '22023';
  END IF;

  v_effective_user := COALESCE(auth.uid(), p_user_id);

  INSERT INTO public.security_events (event_type, user_id, ip_address, user_agent, severity, details)
  VALUES (p_event_type, v_effective_user, p_ip_address, p_user_agent, p_severity, p_details)
  RETURNING id INTO v_event_id;
  RETURN v_event_id;
END;
$function$;

-- Loggers stay accessible to both anon and authenticated (used during failed-login flows)
GRANT EXECUTE ON FUNCTION public.log_audit_event(uuid, text, text, text, text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.secure_insert_audit_log(uuid, text, text, uuid, jsonb, jsonb, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_security_event(text, uuid, inet, text, text, jsonb) TO anon, authenticated, service_role;
