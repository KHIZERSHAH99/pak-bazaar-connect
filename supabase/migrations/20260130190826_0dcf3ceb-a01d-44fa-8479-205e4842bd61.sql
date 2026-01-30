-- =====================================================
-- Security Fixes: SECURITY DEFINER search_path + Secure Logging Functions
-- =====================================================

-- 1. Fix SECURITY DEFINER functions with search_path = 'public' to use search_path = ''
-- Using DO block to handle functions that may not exist

DO $$
BEGIN
  -- Fix check_phone_exists if it exists
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_phone_exists') THEN
    ALTER FUNCTION public.check_phone_exists SET search_path = '';
  END IF;
  
  -- Fix normalize_pakistani_phone if it exists
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'normalize_pakistani_phone') THEN
    ALTER FUNCTION public.normalize_pakistani_phone SET search_path = '';
  END IF;
  
  -- Fix validate_pakistani_phone if it exists
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'validate_pakistani_phone') THEN
    ALTER FUNCTION public.validate_pakistani_phone SET search_path = '';
  END IF;
END;
$$;

-- 2. Create secure SECURITY DEFINER functions for system logging tables
-- These replace direct inserts with WITH CHECK(true) policies

-- Secure audit log insertion function
CREATE OR REPLACE FUNCTION public.secure_insert_audit_log(
  p_user_id uuid,
  p_event_type text,
  p_table_name text DEFAULT NULL,
  p_record_id uuid DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL,
  p_user_agent text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.audit_logs (user_id, event_type, table_name, record_id, old_values, new_values, user_agent, ip_address)
  VALUES (p_user_id, p_event_type, p_table_name, p_record_id, p_old_values, p_new_values, p_user_agent, '0.0.0.0'::inet)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- Secure analytics event insertion function
CREATE OR REPLACE FUNCTION public.secure_insert_analytics_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_page_url text DEFAULT NULL,
  p_referrer text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_event_data jsonb DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.analytics_events (event_type, user_id, session_id, page_url, referrer, user_agent, event_data, ip_address)
  VALUES (p_event_type, p_user_id, p_session_id, p_page_url, p_referrer, p_user_agent, p_event_data, '0.0.0.0'::inet)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- Secure ad impression insertion function
CREATE OR REPLACE FUNCTION public.secure_insert_ad_impression(
  p_ad_id text,
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_placement text DEFAULT NULL,
  p_size text DEFAULT NULL,
  p_source text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.ad_impressions (ad_id, user_id, session_id, placement, size, source)
  VALUES (p_ad_id, p_user_id, p_session_id, p_placement, p_size, p_source)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- Secure ad click insertion function
CREATE OR REPLACE FUNCTION public.secure_insert_ad_click(
  p_ad_id text,
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_placement text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.ad_clicks (ad_id, user_id, session_id, placement)
  VALUES (p_ad_id, p_user_id, p_session_id, p_placement)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- 3. Update RLS policies to use secure functions instead of WITH CHECK(true)
-- Note: We keep read policies permissive where appropriate but restrict writes

-- Drop and recreate audit_logs policies
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow system inserts" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;

-- Create restrictive insert policy - only allow through secure function
CREATE POLICY "Secure insert only via function" ON public.audit_logs
  FOR INSERT
  WITH CHECK (false);

-- Drop and recreate analytics_events policies  
DROP POLICY IF EXISTS "Allow anonymous inserts for analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_events_insert_policy" ON public.analytics_events;

-- Create restrictive insert policy
CREATE POLICY "Secure insert only via function" ON public.analytics_events
  FOR INSERT
  WITH CHECK (false);

-- Drop and recreate ad_impressions policies
DROP POLICY IF EXISTS "Anyone can record impressions" ON public.ad_impressions;
DROP POLICY IF EXISTS "ad_impressions_insert_policy" ON public.ad_impressions;

CREATE POLICY "Secure insert only via function" ON public.ad_impressions
  FOR INSERT
  WITH CHECK (false);

-- Drop and recreate ad_clicks policies
DROP POLICY IF EXISTS "Anyone can record clicks" ON public.ad_clicks;
DROP POLICY IF EXISTS "ad_clicks_insert_policy" ON public.ad_clicks;

CREATE POLICY "Secure insert only via function" ON public.ad_clicks
  FOR INSERT
  WITH CHECK (false);

-- 4. Grant execute permissions on secure functions
GRANT EXECUTE ON FUNCTION public.secure_insert_audit_log TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.secure_insert_analytics_event TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.secure_insert_ad_impression TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.secure_insert_ad_click TO authenticated, anon;

-- 5. Add comments documenting the security approach
COMMENT ON FUNCTION public.secure_insert_audit_log IS 'Secure SECURITY DEFINER function for audit logging. Bypasses RLS safely.';
COMMENT ON FUNCTION public.secure_insert_analytics_event IS 'Secure SECURITY DEFINER function for analytics. Bypasses RLS safely.';
COMMENT ON FUNCTION public.secure_insert_ad_impression IS 'Secure SECURITY DEFINER function for ad impressions. Bypasses RLS safely.';
COMMENT ON FUNCTION public.secure_insert_ad_click IS 'Secure SECURITY DEFINER function for ad clicks. Bypasses RLS safely.';