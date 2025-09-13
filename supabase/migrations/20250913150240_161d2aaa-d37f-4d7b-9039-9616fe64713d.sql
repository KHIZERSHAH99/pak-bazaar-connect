-- ============================================
-- CRITICAL SECURITY FIXES FOR PAK BAZAAR CONNECT
-- ============================================

-- 1. DROP THE DANGEROUS PUBLIC PROFILE VIEW POLICY
-- This is exposing all user data publicly!
DROP POLICY IF EXISTS "profiles_public_view" ON public.profiles;

-- 2. CREATE PROPER SECURE PROFILE ACCESS POLICIES
-- Users can only view their own complete profile
CREATE POLICY "users_view_own_profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- 3. CREATE A SECURE FUNCTION FOR PROFILE SUMMARIES
-- This will be used when we need to show limited profile info (e.g., in orders)
CREATE OR REPLACE FUNCTION public.get_safe_profile_summary(profile_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Only return non-sensitive information
  SELECT jsonb_build_object(
    'business_name', p.business_name,
    'contact_name', p.contact_name,
    'city', p.city,
    'role', p.role,
    'verification_status', p.verification_status
  ) INTO result
  FROM public.profiles p
  WHERE p.id = profile_id;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- 4. FIX GUEST ORDER SECURITY
-- Add a proper guest identifier column if not exists
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS guest_session_id uuid DEFAULT NULL;

-- Add index for guest session queries
CREATE INDEX IF NOT EXISTS idx_orders_guest_session ON public.orders(guest_session_id);

-- Update the order validation trigger to handle guest sessions properly
CREATE OR REPLACE FUNCTION public.validate_order_security()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Validate order amount is reasonable
  IF NEW.total_amount <= 0 OR NEW.total_amount > 10000000 THEN
    RAISE EXCEPTION 'Invalid order amount: %', NEW.total_amount;
  END IF;
  
  -- For authenticated users, prevent self-ordering
  IF NEW.buyer_id != '00000000-0000-0000-0000-000000000000' AND EXISTS (
    SELECT 1 FROM public.shops s 
    WHERE s.id = NEW.shop_id 
    AND s.owner_id = NEW.buyer_id
  ) THEN
    RAISE EXCEPTION 'Cannot order from your own shop';
  END IF;
  
  -- Set guest flag and session for guest orders
  IF NEW.buyer_id = '00000000-0000-0000-0000-000000000000' THEN
    NEW.is_guest_order = true;
    -- Ensure guest orders have a session ID
    IF NEW.guest_session_id IS NULL THEN
      NEW.guest_session_id = gen_random_uuid();
    END IF;
  END IF;
  
  -- Log order creation for security monitoring
  INSERT INTO public.audit_logs (user_id, event_type, table_name, record_id, new_values)
  VALUES (
    COALESCE(NEW.buyer_id, '00000000-0000-0000-0000-000000000000'),
    'order_created',
    'orders',
    NEW.id,
    jsonb_build_object(
      'shop_id', NEW.shop_id,
      'total_amount', NEW.total_amount,
      'payment_method', NEW.payment_method,
      'is_guest_order', NEW.is_guest_order,
      'guest_session_id', NEW.guest_session_id
    )
  );
  
  RETURN NEW;
END;
$$;

-- 5. ADD RATE LIMITING FOR GUEST ORDERS
CREATE OR REPLACE FUNCTION public.check_guest_order_rate_limit(p_session_id uuid, p_ip_address inet)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_orders integer;
BEGIN
  -- Check recent orders from this session/IP
  SELECT COUNT(*) INTO recent_orders
  FROM public.orders
  WHERE created_at > NOW() - INTERVAL '1 hour'
    AND (guest_session_id = p_session_id 
         OR (buyer_id = '00000000-0000-0000-0000-000000000000' 
             AND EXISTS (
               SELECT 1 FROM public.audit_logs 
               WHERE record_id = orders.id 
                 AND new_values->>'ip_address' = p_ip_address::text
             )
         ));
  
  -- Allow max 5 guest orders per hour
  IF recent_orders >= 5 THEN
    -- Log potential abuse
    INSERT INTO public.audit_logs (user_id, event_type, table_name, new_values)
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      'guest_order_rate_limit_exceeded',
      'orders',
      jsonb_build_object(
        'session_id', p_session_id,
        'ip_address', p_ip_address::text,
        'recent_orders', recent_orders
      )
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 6. CREATE ENCRYPTED COLUMNS FOR SENSITIVE PAYMENT DATA
-- Note: In production, you should use Supabase Vault for encryption
ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS account_number_masked text,
ADD COLUMN IF NOT EXISTS jazzcash_masked text,
ADD COLUMN IF NOT EXISTS easypaisa_masked text;

-- Update existing payment methods to use masked versions
UPDATE public.payment_methods
SET 
  account_number_masked = CASE 
    WHEN account_number IS NOT NULL THEN 
      'XXXX-XXXX-' || RIGHT(account_number, 4)
    ELSE NULL
  END,
  jazzcash_masked = CASE 
    WHEN jazzcash_number IS NOT NULL THEN 
      '****' || RIGHT(jazzcash_number, 4)
    ELSE NULL
  END,
  easypaisa_masked = CASE 
    WHEN easypaisa_number IS NOT NULL THEN 
      '****' || RIGHT(easypaisa_number, 4)
    ELSE NULL
  END
WHERE account_number_masked IS NULL;

-- 7. CREATE A SECURE FUNCTION TO GET PAYMENT METHODS
CREATE OR REPLACE FUNCTION public.get_secure_payment_methods(shop_id uuid)
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
AS $$
BEGIN
  -- Only return masked payment information
  RETURN QUERY
  SELECT 
    pm.id,
    pm.wholesaler_id,
    pm.bank_name,
    pm.account_title,
    pm.account_number_masked,
    pm.jazzcash_masked,
    pm.easypaisa_masked,
    pm.is_active
  FROM public.payment_methods pm
  JOIN public.shops s ON s.owner_id = pm.wholesaler_id
  WHERE s.id = shop_id AND pm.is_active = true;
END;
$$;

-- 8. ADD SESSION MANAGEMENT FOR BETTER SECURITY
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  ip_address inet,
  user_agent text,
  last_activity timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on sessions table
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "users_manage_own_sessions" ON public.user_sessions
FOR ALL USING (user_id = auth.uid());

-- 9. CREATE SECURITY MONITORING FUNCTION
CREATE OR REPLACE FUNCTION public.monitor_security_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  suspicious_activity RECORD;
BEGIN
  -- Check for multiple failed login attempts
  FOR suspicious_activity IN
    SELECT 
      new_values->>'phone' as identifier,
      COUNT(*) as attempt_count
    FROM public.audit_logs
    WHERE event_type IN ('login_failed', 'auth_failed_no_user', 'otp_failed')
      AND created_at > NOW() - INTERVAL '10 minutes'
      AND new_values->>'phone' IS NOT NULL
    GROUP BY new_values->>'phone'
    HAVING COUNT(*) > 5
  LOOP
    -- Alert about suspicious activity
    INSERT INTO public.audit_logs (user_id, event_type, table_name, new_values)
    VALUES (
      NULL,
      'security_alert_brute_force',
      'security_monitoring',
      jsonb_build_object(
        'identifier', suspicious_activity.identifier,
        'attempt_count', suspicious_activity.attempt_count,
        'alert_time', NOW()
      )
    );
  END LOOP;
  
  -- Check for data exfiltration attempts
  FOR suspicious_activity IN
    SELECT 
      user_id,
      COUNT(*) as query_count
    FROM public.audit_logs
    WHERE event_type LIKE '%view%' OR event_type LIKE '%access%'
      AND created_at > NOW() - INTERVAL '5 minutes'
      AND user_id IS NOT NULL
    GROUP BY user_id
    HAVING COUNT(*) > 100
  LOOP
    INSERT INTO public.audit_logs (user_id, event_type, table_name, new_values)
    VALUES (
      suspicious_activity.user_id,
      'security_alert_data_exfiltration',
      'security_monitoring',
      jsonb_build_object(
        'query_count', suspicious_activity.query_count,
        'time_window', '5 minutes',
        'alert_time', NOW()
      )
    );
  END LOOP;
END;
$$;

-- 10. SCHEDULE PERIODIC SECURITY MONITORING (Run every hour)
-- Note: This would typically be done via a cron job or Supabase Edge Function
-- For now, we'll create the function that can be called periodically

-- Log this security update
INSERT INTO public.audit_logs (user_id, event_type, table_name, new_values)
VALUES (
  auth.uid(),
  'critical_security_update_applied',
  'system',
  jsonb_build_object(
    'version', '1.0.0',
    'fixes_applied', ARRAY[
      'removed_public_profile_access',
      'added_secure_profile_functions',
      'fixed_guest_order_security',
      'added_rate_limiting',
      'masked_payment_data',
      'added_session_management',
      'added_security_monitoring'
    ],
    'applied_at', NOW()
  )
);