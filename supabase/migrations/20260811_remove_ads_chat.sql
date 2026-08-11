-- Migration: remove ads and chat_history (chatbot) features
-- Ads removal (from A to Z): drop table, RLS policies, related functions, grants
-- Chatbot removal: drop chat_history table and related cleanup function

-- 1. Drop ads RLS policies (drop table cascades these, but be explicit for clarity)
DROP POLICY IF EXISTS "Public can view active ads" ON public.ads;
DROP POLICY IF EXISTS "Admin can manage all ads" ON public.ads;
DROP POLICY IF EXISTS "Wholesalers can manage their own ads" ON public.ads;
DROP POLICY IF EXISTS "Wholesaler can access their own ads" ON public.ads;
DROP POLICY IF EXISTS "Wholesaler can insert ad" ON public.ads;
DROP POLICY IF EXISTS "Wholesaler can update their own ads" ON public.ads;
DROP POLICY IF EXISTS "Wholesalers can create their own ads" ON public.ads;
DROP POLICY IF EXISTS "Wholesalers can update their own ads" ON public.ads;
DROP POLICY IF EXISTS "Wholesalers can view their own ads" ON public.ads;
DROP POLICY IF EXISTS "Sellers can view active ads" ON public.ads;
DROP POLICY IF EXISTS "Admin can view all ads" ON public.ads;
DROP POLICY IF EXISTS "Admin can update all ads" ON public.ads;
DROP POLICY IF EXISTS "Admins can update ads" ON public.ads;
DROP POLICY IF EXISTS "Admins can view all ads" ON public.ads;
DROP POLICY IF EXISTS "ads_admin_view" ON public.ads;
DROP POLICY IF EXISTS "ads_admin_manage" ON public.ads;

-- 2. Drop ads analytics/click helper functions
DROP FUNCTION IF EXISTS public.secure_insert_ad_click(text, uuid, text, text);
DROP FUNCTION IF EXISTS public.secure_insert_ad_impression(text, uuid, text, text, text, text);

-- 3. Drop the ads table (cascades remaining policies, triggers, indexes, constraints)
DROP TABLE IF EXISTS public.ads CASCADE;

-- 4. Drop chat_history (chatbot) table and its cleanup function
DROP TABLE IF EXISTS public.chat_history CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_old_chat_history();

-- 5. Rewrite run_all_cleanups() to no longer reference chat_history
CREATE OR REPLACE FUNCTION public.run_all_cleanups()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.role() <> 'service_role' AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  RETURN jsonb_build_object(
    'notifications', public.cleanup_old_notifications(),
    'sessions', public.cleanup_expired_sessions(),
    'analytics', public.cleanup_old_analytics(),
    'audit_logs', public.cleanup_old_audit_logs(),
    'screenshots', public.cleanup_expired_screenshots(),
    'auth_attempts', public.cleanup_old_auth_attempts(),
    'rate_limits', public.cleanup_stale_rate_limits(),
    'security_events', public.cleanup_old_security_events(),
    'cleaned_at', now()
  );
END;
$$;