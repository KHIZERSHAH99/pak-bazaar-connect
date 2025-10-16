-- Phase 1: Critical Database Cleanup & Optimization

-- 1. Drop OTP-related tables and functions (no longer used)
DROP TABLE IF EXISTS public.otp_verifications CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_expired_otps() CASCADE;
DROP FUNCTION IF EXISTS public.generate_otp() CASCADE;
DROP FUNCTION IF EXISTS public.send_otp_sms(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.verify_otp(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_old_otp_records() CASCADE;

-- 2. Improve cleanup functions with more aggressive retention
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs_aggressive()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Keep only 30 days (was 90), except critical events
  DELETE FROM public.audit_logs 
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND event_type NOT IN (
      'admin_role_granted',
      'unauthorized_admin_attempt',
      'suspicious_access_pattern',
      'potential_security_breach',
      'data_breach_attempt',
      'role_changed'
    );
    
  -- Log cleanup action
  INSERT INTO public.audit_logs (event_type, new_values)
  VALUES (
    'automated_cleanup',
    jsonb_build_object(
      'action', 'audit_logs_cleanup',
      'retention_days', 30,
      'cleaned_at', NOW()
    )
  );
END;
$$;

-- 3. More aggressive screenshot cleanup (24 hours instead of 12)
CREATE OR REPLACE FUNCTION public.cleanup_payment_screenshots_aggressive()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Delete screenshots older than 24 hours for all statuses
  UPDATE public.orders
  SET payment_screenshot = NULL,
      screenshot_uploaded_at = NULL
  WHERE screenshot_uploaded_at < NOW() - INTERVAL '24 hours'
    AND payment_screenshot IS NOT NULL;
    
  -- Log cleanup
  INSERT INTO public.audit_logs (event_type, new_values)
  VALUES (
    'automated_cleanup',
    jsonb_build_object(
      'action', 'screenshot_cleanup',
      'retention_hours', 24,
      'cleaned_at', NOW()
    )
  );
END;
$$;

-- 4. Cleanup product views (30 days instead of 90)
CREATE OR REPLACE FUNCTION public.cleanup_product_views_aggressive()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.product_views 
  WHERE viewed_at < NOW() - INTERVAL '30 days';
  
  INSERT INTO public.audit_logs (event_type, new_values)
  VALUES (
    'automated_cleanup',
    jsonb_build_object(
      'action', 'product_views_cleanup',
      'retention_days', 30,
      'cleaned_at', NOW()
    )
  );
END;
$$;

-- 5. Cleanup old SMS logs (7 days)
CREATE OR REPLACE FUNCTION public.cleanup_sms_logs_aggressive()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.sms_logs 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  INSERT INTO public.audit_logs (event_type, new_values)
  VALUES (
    'automated_cleanup',
    jsonb_build_object(
      'action', 'sms_logs_cleanup',
      'retention_days', 7,
      'cleaned_at', NOW()
    )
  );
END;
$$;

-- 6. Cleanup old auth attempts (7 days)
CREATE OR REPLACE FUNCTION public.cleanup_auth_attempts_aggressive()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.auth_attempts 
  WHERE attempted_at < NOW() - INTERVAL '7 days';
  
  INSERT INTO public.audit_logs (event_type, new_values)
  VALUES (
    'automated_cleanup',
    jsonb_build_object(
      'action', 'auth_attempts_cleanup',
      'retention_days', 7,
      'cleaned_at', NOW()
    )
  );
END;
$$;

-- 7. Archive and cleanup old guest orders (30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_guest_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete guest orders older than 30 days
  DELETE FROM public.orders
  WHERE is_guest_order = true
    AND created_at < NOW() - INTERVAL '30 days'
    AND status IN ('rejected', 'completed');
    
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  INSERT INTO public.audit_logs (event_type, new_values)
  VALUES (
    'automated_cleanup',
    jsonb_build_object(
      'action', 'guest_orders_cleanup',
      'retention_days', 30,
      'deleted_count', deleted_count,
      'cleaned_at', NOW()
    )
  );
END;
$$;

-- 8. Master cleanup function to run all cleanups
CREATE OR REPLACE FUNCTION public.run_all_cleanups()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.cleanup_old_audit_logs_aggressive();
  PERFORM public.cleanup_payment_screenshots_aggressive();
  PERFORM public.cleanup_product_views_aggressive();
  PERFORM public.cleanup_sms_logs_aggressive();
  PERFORM public.cleanup_auth_attempts_aggressive();
  PERFORM public.cleanup_old_guest_orders();
  
  -- Vacuum analyze to reclaim space
  VACUUM ANALYZE;
END;
$$;

-- 9. Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_created_status ON public.orders(created_at DESC, status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_created ON public.orders(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_shop_created ON public.orders(shop_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_type ON public.audit_logs(created_at DESC, event_type);
CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON public.product_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_shop_active ON public.products(shop_id, is_active);

COMMENT ON FUNCTION public.run_all_cleanups IS 'Master cleanup function - run daily to maintain database size under free tier limits';