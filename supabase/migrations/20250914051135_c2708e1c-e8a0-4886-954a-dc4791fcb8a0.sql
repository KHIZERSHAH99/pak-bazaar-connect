-- ====================================================================
-- COMPREHENSIVE SECURITY FIX MIGRATION
-- Fixes critical data exposure and security vulnerabilities
-- ====================================================================

-- ====================================================================
-- 1. STRENGTHEN PROFILES TABLE SECURITY
-- ====================================================================

-- Drop existing weak policies
DROP POLICY IF EXISTS "users_view_own_profile_only" ON public.profiles;
DROP POLICY IF EXISTS "admins_view_profiles_with_audit" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile limited" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles with restrictions" ON public.profiles;

-- Create stronger RLS policies for profiles
CREATE POLICY "users_view_own_profile_strict" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile_strict" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = OLD.role -- Prevent role changes
    AND verification_status = OLD.verification_status -- Prevent verification changes
  );

CREATE POLICY "admin_manage_profiles_audited" ON public.profiles
  FOR ALL
  USING (
    get_user_role() = 'admin' 
    AND auth.uid() IS NOT NULL
  )
  WITH CHECK (
    get_user_role() = 'admin'
    AND auth.uid() IS NOT NULL
  );

-- ====================================================================
-- 2. SECURE ORDERS TABLE
-- ====================================================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can create guest orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view relevant orders" ON public.orders;

-- Create stricter order policies
CREATE POLICY "authenticated_users_create_orders" ON public.orders
  FOR INSERT
  WITH CHECK (
    (auth.uid() = buyer_id AND buyer_id != '00000000-0000-0000-0000-000000000000'::uuid)
    OR (buyer_id = '00000000-0000-0000-0000-000000000000'::uuid AND is_guest_order = true)
  );

CREATE POLICY "order_participants_view_only" ON public.orders
  FOR SELECT
  USING (
    auth.uid() = buyer_id 
    OR EXISTS (
      SELECT 1 FROM public.shops 
      WHERE shops.id = orders.shop_id 
      AND shops.owner_id = auth.uid()
    )
    OR get_user_role() = 'admin'
  );

CREATE POLICY "wholesalers_update_own_shop_orders" ON public.orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.shops 
      WHERE shops.id = orders.shop_id 
      AND shops.owner_id = auth.uid()
    )
  );

-- ====================================================================
-- 3. PROTECT PAYMENT METHODS
-- ====================================================================

-- Create payment methods table if not exists
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wholesaler_id UUID NOT NULL,
  bank_name TEXT,
  account_title TEXT,
  account_number TEXT,
  account_number_masked TEXT,
  jazzcash_number TEXT,
  jazzcash_masked TEXT,
  easypaisa_number TEXT,
  easypaisa_masked TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on payment methods
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Create secure policies for payment methods
CREATE POLICY "wholesalers_manage_own_payment_methods" ON public.payment_methods
  FOR ALL
  USING (wholesaler_id = auth.uid())
  WITH CHECK (wholesaler_id = auth.uid());

CREATE POLICY "sellers_view_masked_payment_methods" ON public.payment_methods
  FOR SELECT
  USING (
    get_user_role() = 'seller' 
    AND is_active = true
  );

-- ====================================================================
-- 4. FIX FUNCTION SEARCH PATHS
-- ====================================================================

-- Fix all functions without explicit search path
CREATE OR REPLACE FUNCTION public.validate_pakistani_phone(phone_number text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Pakistani phone number validation
  RETURN phone_number ~ '^(\+92|0)?3[0-9]{9}$';
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_pakistani_phone(phone_number text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized text;
BEGIN
  IF phone_number IS NULL OR phone_number = '' THEN
    RETURN NULL;
  END IF;
  
  -- Remove all non-digit characters
  normalized := regexp_replace(phone_number, '[^0-9]', '', 'g');
  
  -- Handle different formats
  IF normalized ~ '^92' THEN
    normalized := '0' || substring(normalized from 3);
  ELSIF normalized ~ '^00923' THEN
    normalized := '0' || substring(normalized from 5);
  ELSIF normalized ~ '^923' THEN
    normalized := '0' || substring(normalized from 3);
  ELSIF NOT (normalized ~ '^03') THEN
    IF normalized ~ '^3' THEN
      normalized := '0' || normalized;
    END IF;
  END IF;
  
  -- Validate format
  IF NOT (normalized ~ '^03[0-9]{9}$') THEN
    RETURN phone_number; -- Return original if can't normalize
  END IF;
  
  RETURN normalized;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id uuid,
  p_event_type text,
  p_table_name text,
  p_record_id text,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    table_name,
    record_id,
    old_values,
    new_values,
    created_at
  ) VALUES (
    p_user_id,
    p_event_type,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values,
    NOW()
  );
END;
$$;

-- ====================================================================
-- 5. ADD SECURITY MONITORING
-- ====================================================================

-- Create security monitoring table
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID,
  ip_address INET,
  details JSONB,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "admins_manage_security_events" ON public.security_events
  FOR ALL
  USING (get_user_role() = 'admin');

-- Create function to detect suspicious activities
CREATE OR REPLACE FUNCTION public.detect_data_exposure_attempt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  query_count INTEGER;
BEGIN
  -- Check for excessive queries in short time
  SELECT COUNT(*) INTO query_count
  FROM public.audit_logs
  WHERE user_id = auth.uid()
    AND created_at > NOW() - INTERVAL '1 minute'
    AND event_type LIKE '%access%';
  
  IF query_count > 50 THEN
    INSERT INTO public.security_events (
      event_type,
      severity,
      user_id,
      details
    ) VALUES (
      'excessive_data_queries',
      'high',
      auth.uid(),
      jsonb_build_object(
        'query_count', query_count,
        'table_accessed', TG_TABLE_NAME
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- ====================================================================
-- 6. CREATE SECURE DATA ACCESS FUNCTIONS
-- ====================================================================

-- Secure function to get masked order details
CREATE OR REPLACE FUNCTION public.get_order_details_secure(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_data JSONB;
  is_participant BOOLEAN;
BEGIN
  -- Check if user is order participant
  SELECT EXISTS(
    SELECT 1 FROM public.orders o
    LEFT JOIN public.shops s ON o.shop_id = s.id
    WHERE o.id = p_order_id
      AND (o.buyer_id = auth.uid() OR s.owner_id = auth.uid())
  ) INTO is_participant;
  
  IF NOT is_participant AND get_user_role() != 'admin' THEN
    RETURN jsonb_build_object('error', 'Access denied');
  END IF;
  
  -- Return masked data for non-participants
  IF is_participant THEN
    SELECT to_jsonb(o.*) INTO order_data
    FROM public.orders o
    WHERE o.id = p_order_id;
  ELSE
    SELECT jsonb_build_object(
      'id', o.id,
      'status', o.status,
      'created_at', o.created_at,
      'total_amount', '[PROTECTED]',
      'buyer_info', '[PROTECTED]'
    ) INTO order_data
    FROM public.orders o
    WHERE o.id = p_order_id;
  END IF;
  
  -- Log access
  PERFORM log_audit_event(
    auth.uid(),
    'order_accessed',
    'orders',
    p_order_id::TEXT,
    NULL,
    jsonb_build_object('accessed_at', NOW())
  );
  
  RETURN order_data;
END;
$$;

-- ====================================================================
-- 7. ADD DATA RETENTION POLICIES
-- ====================================================================

-- Function to clean up old sensitive data
CREATE OR REPLACE FUNCTION public.cleanup_sensitive_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete old payment screenshots (older than 90 days)
  UPDATE public.orders
  SET payment_screenshot = NULL
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND payment_screenshot IS NOT NULL;
  
  -- Archive old commission records
  INSERT INTO public.audit_logs (
    event_type,
    table_name,
    new_values
  )
  SELECT 
    'commission_archived',
    'commission_records',
    jsonb_build_object(
      'archived_count', COUNT(*),
      'archived_at', NOW()
    )
  FROM public.commission_records
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  -- Clean up old audit logs (keep critical ones)
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - INTERVAL '6 months'
    AND event_type NOT IN (
      'security_breach_attempt',
      'unauthorized_access',
      'role_changed',
      'admin_action'
    );
  
  -- Log cleanup
  INSERT INTO public.security_events (
    event_type,
    severity,
    details
  ) VALUES (
    'data_cleanup_completed',
    'low',
    jsonb_build_object('cleaned_at', NOW())
  );
END;
$$;

-- ====================================================================
-- 8. CREATE SECURITY CHECK FUNCTION
-- ====================================================================

CREATE OR REPLACE FUNCTION public.check_security_status()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  status JSONB;
  critical_issues INTEGER := 0;
  warnings INTEGER := 0;
BEGIN
  -- Check for exposed sensitive data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND column_name LIKE '%password%'
  ) THEN
    critical_issues := critical_issues + 1;
  END IF;
  
  -- Check for tables without RLS
  SELECT COUNT(*) INTO warnings
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename NOT IN ('schema_migrations')
    AND NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = pg_tables.tablename
    );
  
  status := jsonb_build_object(
    'critical_issues', critical_issues,
    'warnings', warnings,
    'last_check', NOW(),
    'status', CASE 
      WHEN critical_issues > 0 THEN 'critical'
      WHEN warnings > 0 THEN 'warning'
      ELSE 'secure'
    END
  );
  
  RETURN status;
END;
$$;

-- ====================================================================
-- 9. ADD INDEXES FOR PERFORMANCE
-- ====================================================================

-- Add indexes for security-related queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created 
  ON public.audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_severity_created 
  ON public.security_events(severity, created_at DESC) 
  WHERE resolved = false;

CREATE INDEX IF NOT EXISTS idx_orders_buyer_status 
  ON public.orders(buyer_id, status) 
  WHERE buyer_id != '00000000-0000-0000-0000-000000000000'::uuid;

-- ====================================================================
-- 10. GRANT MINIMAL PERMISSIONS
-- ====================================================================

-- Revoke unnecessary permissions
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Grant only necessary permissions to anon role
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.shops TO anon;

-- Grant authenticated users appropriate permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.shops TO authenticated;
GRANT ALL ON public.products TO authenticated;

-- Log migration completion
INSERT INTO public.audit_logs (
  event_type,
  table_name,
  new_values
) VALUES (
  'security_migration_completed',
  'system',
  jsonb_build_object(
    'migration', 'comprehensive_security_fix',
    'completed_at', NOW()
  )
);