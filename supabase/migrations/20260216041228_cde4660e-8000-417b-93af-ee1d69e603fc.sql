
-- 1. Fix 3 SECURITY DEFINER functions missing search_path
ALTER FUNCTION public.calculate_shipping_cost SET search_path = '';
ALTER FUNCTION public.generate_otp SET search_path = '';
ALTER FUNCTION public.get_active_products_list SET search_path = '';

-- 2. Drop redundant WITH CHECK(true) policies (false ones already block direct inserts)
DROP POLICY IF EXISTS "Public can insert ad clicks" ON public.ad_clicks;
DROP POLICY IF EXISTS "Public can insert ad impressions" ON public.ad_impressions;
DROP POLICY IF EXISTS "System can insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "System insert audit logs" ON public.audit_logs;

-- 3. Create secure insert functions for remaining tables with WITH CHECK(true)

-- Secure notification insert
CREATE OR REPLACE FUNCTION public.secure_insert_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text
) RETURNS void AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (p_user_id, p_title, p_message, p_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Secure product view tracking
CREATE OR REPLACE FUNCTION public.secure_track_product_view(
  p_product_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO public.product_views (product_id, user_id, session_id)
  VALUES (p_product_id, p_user_id, p_session_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Secure rate limit insert/update
CREATE OR REPLACE FUNCTION public.secure_check_rate_limit(
  p_identifier text,
  p_action text,
  p_max_requests int DEFAULT 50,
  p_window_minutes int DEFAULT 60
) RETURNS boolean AS $$
DECLARE
  v_count int;
  v_window_start timestamptz;
BEGIN
  v_window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  SELECT count INTO v_count FROM public.rate_limits
  WHERE identifier = p_identifier AND action = p_action AND window_start > v_window_start;
  
  IF v_count IS NULL THEN
    INSERT INTO public.rate_limits (identifier, action, count, window_start)
    VALUES (p_identifier, p_action, 1, now());
    RETURN true;
  ELSIF v_count >= p_max_requests THEN
    RETURN false;
  ELSE
    UPDATE public.rate_limits SET count = count + 1
    WHERE identifier = p_identifier AND action = p_action AND window_start > v_window_start;
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 4. Replace WITH CHECK(true) with WITH CHECK(false) on remaining tables
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Secure insert only via function" ON public.notifications FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "Users can track product views" ON public.product_views;
CREATE POLICY "Secure insert only via function" ON public.product_views FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "rate_limits_insert" ON public.rate_limits;
CREATE POLICY "Secure insert only via function" ON public.rate_limits FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "sms_system_insert" ON public.sms_logs;
CREATE POLICY "Secure insert only via function" ON public.sms_logs FOR INSERT WITH CHECK (false);
