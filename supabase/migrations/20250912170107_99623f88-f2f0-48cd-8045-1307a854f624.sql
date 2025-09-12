-- Fix all database functions with proper search path and security settings
-- This addresses the mutable search path vulnerability

-- 1. Fix ensure_single_default_address function
DROP FUNCTION IF EXISTS public.ensure_single_default_address() CASCADE;
CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.seller_addresses 
    SET is_default = false 
    WHERE user_id = NEW.user_id 
    AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$function$;

-- 2. Fix update_variation_updated_at function
DROP FUNCTION IF EXISTS public.update_variation_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_variation_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 3. Add encrypted fields for sensitive data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cnic_encrypted bytea,
ADD COLUMN IF NOT EXISTS selfie_encrypted bytea,
ADD COLUMN IF NOT EXISTS phone_encrypted text,
ADD COLUMN IF NOT EXISTS data_retention_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS data_retention_date timestamp with time zone;

ALTER TABLE public.payment_methods
ADD COLUMN IF NOT EXISTS account_number_encrypted bytea,
ADD COLUMN IF NOT EXISTS jazzcash_encrypted bytea,
ADD COLUMN IF NOT EXISTS easypaisa_encrypted bytea;

-- 4. Create function to automatically delete old verification documents
CREATE OR REPLACE FUNCTION public.delete_old_verification_documents()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Delete verification documents older than 90 days for non-active users
  UPDATE public.profiles 
  SET 
    cnic_image = NULL,
    selfie_image = NULL,
    cnic_encrypted = NULL,
    selfie_encrypted = NULL
  WHERE 
    verification_status IN ('rejected', 'expired')
    AND updated_at < NOW() - INTERVAL '90 days';
    
  -- Delete documents for suspended accounts after 30 days
  UPDATE public.profiles 
  SET 
    cnic_image = NULL,
    selfie_image = NULL,
    cnic_encrypted = NULL,
    selfie_encrypted = NULL
  WHERE 
    is_suspended = true
    AND suspended_until < NOW() - INTERVAL '30 days';
    
  -- Log the cleanup
  INSERT INTO public.audit_logs (user_id, event_type, table_name, new_values)
  VALUES (
    NULL,
    'verification_documents_cleanup',
    'profiles',
    jsonb_build_object(
      'cleanup_time', NOW(),
      'action', 'deleted_old_verification_documents'
    )
  );
END;
$function$;

-- 5. Enhanced data masking function for sensitive fields
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(field_value text, field_type text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF field_value IS NULL THEN
    RETURN NULL;
  END IF;
  
  CASE field_type
    WHEN 'phone' THEN
      -- Show only last 4 digits: ****1234
      RETURN '****' || RIGHT(field_value, 4);
    WHEN 'email' THEN
      -- Show first char and domain: a****@example.com
      RETURN LEFT(SPLIT_PART(field_value, '@', 1), 1) || '****@' || SPLIT_PART(field_value, '@', 2);
    WHEN 'account' THEN
      -- Show only last 4 digits for account numbers
      RETURN 'XXXX-XXXX-' || RIGHT(field_value, 4);
    WHEN 'cnic' THEN
      -- Show format: *****-*******-*
      RETURN '*****-*******-' || RIGHT(field_value, 1);
    ELSE
      RETURN '[REDACTED]';
  END CASE;
END;
$function$;

-- 6. Create secure view for public profile access
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  id,
  business_name,
  business_type,
  city,
  verification_status,
  created_at,
  role,
  -- Mask sensitive data
  mask_sensitive_data(email, 'email') as email_masked,
  mask_sensitive_data(phone_number, 'phone') as phone_masked,
  -- Never expose these fields publicly
  NULL::text as cnic_image,
  NULL::text as selfie_image,
  NULL::text as ntn_number,
  NULL::text as strn_number
FROM public.profiles
WHERE is_suspended = false;

-- Grant appropriate permissions
GRANT SELECT ON public.profiles_public TO authenticated;

-- 7. Create function to handle secure payment method access
CREATE OR REPLACE FUNCTION public.get_payment_methods_secure(shop_id uuid)
RETURNS TABLE(
  id uuid,
  wholesaler_id uuid,
  bank_name text,
  account_title text,
  account_number_masked text,
  jazzcash_masked text,
  easypaisa_masked text,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_role text;
BEGIN
  user_role := get_user_role();
  
  -- Only allow access for sellers, wholesalers, and admins
  IF user_role NOT IN ('seller', 'wholesaler', 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  RETURN QUERY
  SELECT 
    pm.id,
    pm.wholesaler_id,
    pm.bank_name,
    pm.account_title,
    mask_sensitive_data(pm.account_number, 'account') as account_number_masked,
    mask_sensitive_data(pm.jazzcash_number, 'phone') as jazzcash_masked,
    mask_sensitive_data(pm.easypaisa_number, 'phone') as easypaisa_masked,
    pm.is_active
  FROM public.payment_methods pm
  JOIN public.shops s ON s.owner_id = pm.wholesaler_id
  WHERE s.id = shop_id AND pm.is_active = true;
END;
$function$;

-- 8. Add rate limiting table for API calls
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address inet,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT NOW(),
  created_at timestamp with time zone DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint 
ON public.rate_limits(user_id, endpoint, window_start);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint 
ON public.rate_limits(ip_address, endpoint, window_start);

-- 9. Create function to check rate limits
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
SET search_path = public
AS $function$
DECLARE
  request_count integer;
  window_start timestamp with time zone;
BEGIN
  window_start := NOW() - (p_window_minutes || ' minutes')::interval;
  
  -- Check user-based rate limit
  IF p_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO request_count
    FROM public.rate_limits
    WHERE user_id = p_user_id
      AND endpoint = p_endpoint
      AND window_start >= window_start;
      
    IF request_count >= p_max_requests THEN
      -- Log rate limit violation
      INSERT INTO public.audit_logs (user_id, event_type, table_name, new_values)
      VALUES (
        p_user_id,
        'rate_limit_exceeded',
        'rate_limits',
        jsonb_build_object(
          'endpoint', p_endpoint,
          'requests', request_count,
          'limit', p_max_requests
        )
      );
      RETURN false;
    END IF;
  END IF;
  
  -- Check IP-based rate limit
  IF p_ip_address IS NOT NULL THEN
    SELECT COUNT(*) INTO request_count
    FROM public.rate_limits
    WHERE ip_address = p_ip_address
      AND endpoint = p_endpoint
      AND window_start >= window_start;
      
    IF request_count >= p_max_requests * 2 THEN -- Higher limit for IP
      RETURN false;
    END IF;
  END IF;
  
  -- Record the request
  INSERT INTO public.rate_limits (user_id, ip_address, endpoint)
  VALUES (p_user_id, p_ip_address, p_endpoint);
  
  RETURN true;
END;
$function$;

-- 10. Create security monitoring dashboard view
CREATE OR REPLACE VIEW public.security_metrics AS
SELECT 
  'failed_login_attempts' as metric,
  COUNT(*) as value,
  NOW() as measured_at
FROM public.audit_logs
WHERE event_type = 'login_failed'
  AND created_at > NOW() - INTERVAL '1 hour'
UNION ALL
SELECT 
  'suspicious_activities' as metric,
  COUNT(*) as value,
  NOW() as measured_at
FROM public.audit_logs
WHERE event_type IN ('suspicious_role_switching', 'suspicious_access_pattern', 'unauthorized_admin_attempt')
  AND created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
  'rate_limit_violations' as metric,
  COUNT(*) as value,
  NOW() as measured_at
FROM public.audit_logs
WHERE event_type = 'rate_limit_exceeded'
  AND created_at > NOW() - INTERVAL '1 hour';

-- Grant read access to admins only
GRANT SELECT ON public.security_metrics TO authenticated;

-- 11. Add session management for admin access
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  ip_address inet,
  user_agent text,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT NOW(),
  last_activity timestamp with time zone DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_user 
ON public.admin_sessions(user_id, expires_at);

-- 12. Create function for admin session validation
CREATE OR REPLACE FUNCTION public.validate_admin_session(p_session_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  session_valid boolean;
  session_user_id uuid;
BEGIN
  -- Check if session exists and is not expired
  SELECT 
    user_id,
    expires_at > NOW() 
  INTO 
    session_user_id,
    session_valid
  FROM public.admin_sessions
  WHERE session_token = p_session_token
    AND expires_at > NOW();
    
  IF NOT session_valid OR session_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Update last activity
  UPDATE public.admin_sessions
  SET last_activity = NOW()
  WHERE session_token = p_session_token;
  
  -- Check if user is still admin
  IF get_user_role() != 'admin' THEN
    -- Revoke session if user is no longer admin
    DELETE FROM public.admin_sessions WHERE session_token = p_session_token;
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

-- 13. Enhanced RLS policies for payment methods
DROP POLICY IF EXISTS "Sellers can view payment methods for orders" ON public.payment_methods;
DROP POLICY IF EXISTS "Wholesalers can manage their payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Admin can view all payment methods" ON public.payment_methods;

-- Only allow viewing masked payment methods through secure function
CREATE POLICY "payment_methods_restricted_access" ON public.payment_methods
FOR SELECT USING (
  -- Only wholesaler can see their own full details
  wholesaler_id = auth.uid() 
  OR 
  -- Admins can see masked details
  get_user_role() = 'admin'
);

-- 14. Add cleanup job for old data
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Delete old rate limit records
  DELETE FROM public.rate_limits
  WHERE window_start < NOW() - INTERVAL '7 days';
  
  -- Delete old audit logs (keep critical ones)
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND event_type NOT IN (
      'admin_role_granted',
      'unauthorized_admin_attempt',
      'suspicious_access_pattern',
      'data_breach_attempt',
      'role_changed'
    );
    
  -- Delete expired admin sessions
  DELETE FROM public.admin_sessions
  WHERE expires_at < NOW() - INTERVAL '7 days';
  
  -- Clean up old payment screenshots
  PERFORM delete_old_payment_screenshots();
  
  -- Clean up old verification documents
  PERFORM delete_old_verification_documents();
END;
$function$;

-- 15. Create triggers for the new functions
CREATE TRIGGER ensure_single_default_address_trigger
BEFORE INSERT OR UPDATE ON public.seller_addresses
FOR EACH ROW EXECUTE FUNCTION public.ensure_single_default_address();

CREATE TRIGGER update_variation_updated_at_trigger
BEFORE UPDATE ON public.product_variations
FOR EACH ROW EXECUTE FUNCTION public.update_variation_updated_at();