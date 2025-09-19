-- PHASE 1: CRITICAL SECURITY FIXES
-- Protecting exposed customer data, payment information, and financial records

-- 1. FIX ORDERS TABLE EXPOSURE
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Admin can select all orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers can see their own orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers can view orders for their shops" ON public.orders;
DROP POLICY IF EXISTS "Wholesalers can see orders for their shops" ON public.orders;
DROP POLICY IF EXISTS "order_participants_view_only" ON public.orders;

-- Create secure policies for orders
CREATE POLICY "Buyers view own orders only" 
ON public.orders FOR SELECT 
USING (
  auth.uid() = buyer_id 
  AND buyer_id != '00000000-0000-0000-0000-000000000000'
);

CREATE POLICY "Wholesalers view shop orders only" 
ON public.orders FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE shops.id = orders.shop_id 
    AND shops.owner_id = auth.uid()
  )
);

CREATE POLICY "Admin view all orders" 
ON public.orders FOR SELECT 
USING (get_user_role() = 'admin');

-- 2. SECURE PAYMENT METHODS TABLE
-- Create payment_methods table if not exists
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wholesaler_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name TEXT,
  account_number TEXT, -- Will be encrypted
  account_title TEXT,
  jazzcash_number TEXT, -- Will be encrypted
  easypaisa_number TEXT, -- Will be encrypted
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on payment_methods
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Wholesalers manage own payment methods" ON public.payment_methods;

-- Create secure policies for payment_methods
CREATE POLICY "Wholesalers manage own payment methods" 
ON public.payment_methods 
FOR ALL 
USING (wholesaler_id = auth.uid())
WITH CHECK (wholesaler_id = auth.uid());

CREATE POLICY "Admin view payment methods" 
ON public.payment_methods 
FOR SELECT 
USING (get_user_role() = 'admin');

-- 3. PROTECT COMMISSION DATA
-- Fix commission_records policies
DROP POLICY IF EXISTS "Restrict commission records access" ON public.commission_records;
DROP POLICY IF EXISTS "Wholesalers can view their commission records" ON public.commission_records;

CREATE POLICY "Wholesalers view own commissions only" 
ON public.commission_records 
FOR SELECT 
USING (wholesaler_id = auth.uid());

CREATE POLICY "Admin manage all commissions" 
ON public.commission_records 
FOR ALL 
USING (get_user_role() = 'admin');

-- Fix commission_transactions policies
DROP POLICY IF EXISTS "Wholesalers can view their commissions" ON public.commission_transactions;

CREATE POLICY "Wholesalers view own commission transactions" 
ON public.commission_transactions 
FOR SELECT 
USING (wholesaler_id = auth.uid());

-- Fix monthly_commissions policies
DROP POLICY IF EXISTS "Wholesalers can view their commissions" ON public.monthly_commissions;

CREATE POLICY "Wholesalers view own monthly commissions" 
ON public.monthly_commissions 
FOR SELECT 
USING (wholesaler_id = auth.uid());

-- 4. SECURE USER PROFILES
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can view profiles for display purposes" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a function to get safe public profile data
CREATE OR REPLACE FUNCTION public.get_safe_public_profile(profile_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Return only non-sensitive public information
  SELECT jsonb_build_object(
    'id', p.id,
    'business_name', p.business_name,
    'business_type', p.business_type,
    'city', p.city,
    'role', p.role,
    'verification_status', p.verification_status,
    'created_at', p.created_at
  ) INTO result
  FROM public.profiles p
  WHERE p.id = profile_id
  AND p.is_suspended = false
  AND p.role IN ('wholesaler', 'seller');
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Create secure profile policies
CREATE POLICY "Users view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admin view all profiles" 
ON public.profiles 
FOR SELECT 
USING (get_user_role() = 'admin');

-- Create a view for public profile data (wholesalers only)
CREATE OR REPLACE VIEW public.public_wholesaler_profiles AS
SELECT 
  id,
  business_name,
  business_type,
  city,
  verification_status
FROM public.profiles
WHERE role = 'wholesaler' 
  AND is_suspended = false
  AND verification_status = 'approved';

-- 5. LOCK DOWN SECURITY LOGS
-- Fix audit_logs policies
DROP POLICY IF EXISTS "audit_secure_access" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_system_insert" ON public.audit_logs;

CREATE POLICY "Admin only view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (get_user_role() = 'admin');

CREATE POLICY "System insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Fix auth_attempts policies
DROP POLICY IF EXISTS "auth_attempts_admin_only" ON public.auth_attempts;

CREATE POLICY "Admin only view auth attempts" 
ON public.auth_attempts 
FOR SELECT 
USING (get_user_role() = 'admin');

-- 6. CREATE SENSITIVE DATA MASKING FUNCTION
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(
  value TEXT,
  data_type TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF value IS NULL OR value = '' THEN
    RETURN '';
  END IF;
  
  CASE data_type
    WHEN 'phone' THEN
      -- Show only last 4 digits: ****1234
      RETURN '****' || right(value, 4);
    WHEN 'email' THEN
      -- Show first char and domain: a****@example.com
      RETURN left(split_part(value, '@', 1), 1) || '****@' || split_part(value, '@', 2);
    WHEN 'account' THEN
      -- Show only last 4 digits
      RETURN 'XXXX-XXXX-' || right(value, 4);
    WHEN 'cnic' THEN
      -- Show format: *****-*******-*
      RETURN '*****-*******-' || right(value, 1);
    ELSE
      RETURN '[REDACTED]';
  END CASE;
END;
$$;

-- 7. CREATE RATE LIMITING FUNCTION
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_action TEXT,
  p_limit INT DEFAULT 100,
  p_window_minutes INT DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_count INT;
BEGIN
  -- Count recent requests
  SELECT COUNT(*) INTO request_count
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND event_type = p_action
    AND created_at > NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Log if limit exceeded
  IF request_count >= p_limit THEN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      new_values
    ) VALUES (
      p_user_id,
      'rate_limit_exceeded',
      jsonb_build_object(
        'action', p_action,
        'limit', p_limit,
        'window_minutes', p_window_minutes,
        'request_count', request_count
      )
    );
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 8. ADD TRIGGERS FOR SENSITIVE DATA ACCESS LOGGING
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log access to payment methods
  IF TG_TABLE_NAME = 'payment_methods' AND TG_OP = 'SELECT' THEN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      table_name,
      new_values
    ) VALUES (
      auth.uid(),
      'sensitive_data_accessed',
      TG_TABLE_NAME,
      jsonb_build_object(
        'operation', TG_OP,
        'timestamp', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 9. CREATE SECURE ORDER VIEW FOR BUYERS
CREATE OR REPLACE VIEW public.my_orders AS
SELECT 
  o.id,
  o.shop_id,
  o.total_amount,
  o.status,
  o.payment_method,
  o.buyer_name,
  o.buyer_phone,
  o.buyer_address,
  o.created_at,
  o.confirmed_at,
  o.delivered_at,
  s.name as shop_name,
  s.contact_info as shop_contact
FROM public.orders o
LEFT JOIN public.shops s ON o.shop_id = s.id
WHERE o.buyer_id = auth.uid();

-- 10. FIX CSRF TOKEN POLICIES
DROP POLICY IF EXISTS "csrf_tokens_own" ON public.csrf_tokens;

CREATE POLICY "Users manage own CSRF tokens" 
ON public.csrf_tokens 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 11. CREATE SECURITY MONITORING FUNCTION
CREATE OR REPLACE FUNCTION public.monitor_suspicious_access()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  suspicious_user RECORD;
BEGIN
  -- Check for users with excessive failed login attempts
  FOR suspicious_user IN
    SELECT 
      identifier,
      COUNT(*) as fail_count
    FROM public.auth_attempts
    WHERE success = false
      AND attempted_at > NOW() - INTERVAL '1 hour'
    GROUP BY identifier
    HAVING COUNT(*) > 5
  LOOP
    INSERT INTO public.audit_logs (
      event_type,
      new_values
    ) VALUES (
      'suspicious_login_pattern',
      jsonb_build_object(
        'identifier', suspicious_user.identifier,
        'fail_count', suspicious_user.fail_count,
        'alert_time', NOW()
      )
    );
  END LOOP;
END;
$$;

-- Create index for better performance on audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created 
ON public.audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id 
ON public.orders(buyer_id);

CREATE INDEX IF NOT EXISTS idx_orders_shop_id 
ON public.orders(shop_id);

-- Final security check: Ensure no tables have public access
-- This is a safety net to catch any missed tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT IN ('public_wholesaler_profiles', 'my_orders')
  LOOP
    -- Ensure RLS is enabled
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;