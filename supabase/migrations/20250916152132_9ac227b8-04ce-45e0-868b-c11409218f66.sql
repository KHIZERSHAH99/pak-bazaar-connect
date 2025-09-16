-- Phase 1: Critical Data Protection
-- =====================================

-- 1. Fix function search paths (Critical Security Issue)
ALTER FUNCTION public.log_commission_access() SET search_path = public;
ALTER FUNCTION public.get_commission_data_secure(uuid) SET search_path = public;
ALTER FUNCTION public.archive_old_commission_records() SET search_path = public;
ALTER FUNCTION public.can_access_commission_data(uuid) SET search_path = public;
ALTER FUNCTION public.cleanup_expired_otps() SET search_path = public;
ALTER FUNCTION public.ensure_single_default_address() SET search_path = public;
ALTER FUNCTION public.update_variation_updated_at() SET search_path = public;
ALTER FUNCTION public.delete_old_verification_documents() SET search_path = public;
ALTER FUNCTION public.mask_sensitive_data(text, text) SET search_path = public;
ALTER FUNCTION public.get_payment_methods_secure(uuid) SET search_path = public;
ALTER FUNCTION public.check_rate_limit(uuid, inet, text, integer, integer) SET search_path = public;
ALTER FUNCTION public.validate_admin_session(text) SET search_path = public;
ALTER FUNCTION public.cleanup_old_data() SET search_path = public;
ALTER FUNCTION public.get_safe_profile_summary(uuid) SET search_path = public;
ALTER FUNCTION public.check_guest_order_rate_limit(uuid, inet) SET search_path = public;
ALTER FUNCTION public.get_secure_payment_methods(uuid) SET search_path = public;
ALTER FUNCTION public.monitor_security_events() SET search_path = public;
ALTER FUNCTION public.validate_admin_access(inet) SET search_path = public;
ALTER FUNCTION public.generate_csrf_token() SET search_path = public;
ALTER FUNCTION public.validate_csrf_token(text) SET search_path = public;
ALTER FUNCTION public.get_order_details_secure(uuid) SET search_path = public;
ALTER FUNCTION public.cleanup_sensitive_data() SET search_path = public;
ALTER FUNCTION public.check_security_status() SET search_path = public;
ALTER FUNCTION public.prevent_unauthorized_role_change() SET search_path = public;
ALTER FUNCTION public.get_public_profile_info(uuid) SET search_path = public;
ALTER FUNCTION public.get_profile_summary(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_role() SET search_path = public;
ALTER FUNCTION public.prevent_unauthorized_admin() SET search_path = public;
ALTER FUNCTION public.validate_order_security() SET search_path = public;
ALTER FUNCTION public.track_order_status_changes() SET search_path = public;
ALTER FUNCTION public.log_profile_changes() SET search_path = public;
ALTER FUNCTION public.cleanup_old_product_views() SET search_path = public;
ALTER FUNCTION public.detect_unusual_access_patterns() SET search_path = public;
ALTER FUNCTION public.can_request_otp(text) SET search_path = public;
ALTER FUNCTION public.generate_otp() SET search_path = public;
ALTER FUNCTION public.monitor_product_view_patterns() SET search_path = public;
ALTER FUNCTION public.normalize_phone_trigger() SET search_path = public;
ALTER FUNCTION public.cleanup_old_audit_logs() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.switch_business_role(text) SET search_path = public;
ALTER FUNCTION public.check_user_exists(text, text) SET search_path = public;
ALTER FUNCTION public.associate_phone_with_account(text, text) SET search_path = public;
ALTER FUNCTION public.get_current_commission_rate() SET search_path = public;
ALTER FUNCTION public.get_effective_user_role() SET search_path = public;
ALTER FUNCTION public.check_account_lockout(text) SET search_path = public;

-- 2. Add comprehensive audit logging for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_sensitive_operations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    -- Log all operations on sensitive tables
    IF TG_TABLE_NAME IN ('profiles', 'payment_methods', 'commission_records', 'orders') THEN
        INSERT INTO public.audit_logs (
            user_id,
            event_type,
            table_name,
            record_id,
            old_values,
            new_values,
            ip_address,
            user_agent
        ) VALUES (
            auth.uid(),
            TG_OP || '_' || TG_TABLE_NAME,
            TG_TABLE_NAME,
            CASE 
                WHEN TG_OP = 'DELETE' THEN OLD.id
                ELSE NEW.id
            END,
            CASE 
                WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD)
                ELSE NULL
            END,
            CASE 
                WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW)
                ELSE NULL
            END,
            inet_client_addr(),
            current_setting('request.headers', true)::json->>'user-agent'
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Apply audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_profiles_trigger ON public.profiles;
CREATE TRIGGER audit_profiles_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();

DROP TRIGGER IF EXISTS audit_payment_methods_trigger ON public.payment_methods;
CREATE TRIGGER audit_payment_methods_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.payment_methods
FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();

DROP TRIGGER IF EXISTS audit_commission_records_trigger ON public.commission_records;
CREATE TRIGGER audit_commission_records_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.commission_records
FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();

-- 3. Strengthen RLS policies for critical tables
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles
FOR SELECT
USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Fix payment_methods table RLS
DROP POLICY IF EXISTS "Wholesalers manage payment methods" ON public.payment_methods;
CREATE POLICY "Wholesalers manage payment methods" 
ON public.payment_methods
FOR ALL
USING (wholesaler_id = auth.uid())
WITH CHECK (wholesaler_id = auth.uid());

DROP POLICY IF EXISTS "Sellers view payment methods for shops" ON public.payment_methods;
CREATE POLICY "Sellers view payment methods for shops" 
ON public.payment_methods
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.shops s
        WHERE s.owner_id = payment_methods.wholesaler_id
        AND s.id IN (
            SELECT shop_id FROM public.orders 
            WHERE buyer_id = auth.uid()
        )
    )
);

-- 4. Add rate limiting for sensitive operations
CREATE TABLE IF NOT EXISTS public.operation_rate_limits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    operation text NOT NULL,
    count integer DEFAULT 1,
    window_start timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.operation_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_operation_rate_limits_lookup 
ON public.operation_rate_limits(user_id, operation, window_start);

-- RLS policy for rate limits (system only)
DROP POLICY IF EXISTS "System manages rate limits" ON public.operation_rate_limits;
CREATE POLICY "System manages rate limits" 
ON public.operation_rate_limits
FOR ALL
USING (false)
WITH CHECK (false);

-- Function to check operation rate limits
CREATE OR REPLACE FUNCTION public.check_operation_rate_limit(
    p_operation text,
    p_max_attempts integer DEFAULT 10,
    p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    current_count integer;
    window_start timestamp with time zone;
BEGIN
    window_start := now() - (p_window_minutes || ' minutes')::interval;
    
    -- Count recent attempts
    SELECT COUNT(*) INTO current_count
    FROM public.operation_rate_limits
    WHERE user_id = auth.uid()
    AND operation = p_operation
    AND created_at > window_start;
    
    -- Check if limit exceeded
    IF current_count >= p_max_attempts THEN
        -- Log rate limit violation
        INSERT INTO public.audit_logs (
            user_id,
            event_type,
            table_name,
            new_values
        ) VALUES (
            auth.uid(),
            'rate_limit_exceeded',
            'operation_rate_limits',
            jsonb_build_object(
                'operation', p_operation,
                'attempts', current_count,
                'limit', p_max_attempts
            )
        );
        RETURN false;
    END IF;
    
    -- Record this attempt
    INSERT INTO public.operation_rate_limits (user_id, operation)
    VALUES (auth.uid(), p_operation);
    
    RETURN true;
END;
$function$;

-- 5. Clean up old sensitive data automatically
CREATE OR REPLACE FUNCTION public.delete_old_payment_screenshots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    -- Delete payment screenshots older than 30 days
    UPDATE public.orders
    SET payment_screenshot = NULL
    WHERE payment_screenshot IS NOT NULL
    AND created_at < now() - interval '30 days';
    
    -- Log the cleanup
    INSERT INTO public.audit_logs (
        event_type,
        table_name,
        new_values
    ) VALUES (
        'payment_screenshots_cleanup',
        'orders',
        jsonb_build_object(
            'cleanup_time', now(),
            'retention_days', 30
        )
    );
END;
$function$;

-- 6. Add indexes for better performance on security queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);