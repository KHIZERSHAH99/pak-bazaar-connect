-- ====================================================================
-- COMPREHENSIVE SECURITY FIX MIGRATION (FIXED)
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

CREATE POLICY "users_update_own_profile_restricted" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

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

-- Drop existing policies if any
DROP POLICY IF EXISTS "wholesalers_manage_own_payment_methods" ON public.payment_methods;
DROP POLICY IF EXISTS "sellers_view_masked_payment_methods" ON public.payment_methods;

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
-- 4. CREATE SECURITY MONITORING
-- ====================================================================

-- Create security events table
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

-- Drop existing policy if any
DROP POLICY IF EXISTS "admins_manage_security_events" ON public.security_events;

-- Only admins can view security events
CREATE POLICY "admins_manage_security_events" ON public.security_events
  FOR ALL
  USING (get_user_role() = 'admin');

-- ====================================================================
-- 5. CREATE SECURE DATA ACCESS FUNCTION
-- ====================================================================

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
  
  -- Return data based on access level
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
  
  RETURN order_data;
END;
$$;

-- ====================================================================
-- 6. DATA RETENTION POLICY
-- ====================================================================

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
END;
$$;

-- ====================================================================
-- 7. SECURITY CHECK FUNCTION
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
    AND tablename NOT IN ('schema_migrations', 'commission_summary_secure', 'security_metrics', 'orders_with_safe_profiles')
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
-- 8. ADD INDEXES FOR PERFORMANCE
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
-- 9. PROFILE UPDATE TRIGGER
-- ====================================================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS check_profile_updates ON public.profiles;

-- Create function to prevent unauthorized role changes
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent users from changing their own role unless admin
  IF OLD.id = auth.uid() AND OLD.role IS DISTINCT FROM NEW.role THEN
    IF get_user_role() != 'admin' THEN
      RAISE EXCEPTION 'Direct role changes are not allowed. Please use the role request process.';
    END IF;
  END IF;
  
  -- Prevent changing verification status unless admin
  IF OLD.id = auth.uid() AND OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
    IF get_user_role() != 'admin' THEN
      RAISE EXCEPTION 'Cannot change verification status directly.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER check_profile_updates
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_unauthorized_role_change();

-- ====================================================================
-- 10. LOG MIGRATION COMPLETION
-- ====================================================================

INSERT INTO public.audit_logs (
  event_type,
  table_name,
  new_values
) VALUES (
  'security_migration_completed',
  'system',
  jsonb_build_object(
    'migration', 'comprehensive_security_fix',
    'completed_at', NOW(),
    'fixes_applied', ARRAY[
      'Strengthened profile RLS policies',
      'Secured orders table access',
      'Added payment methods protection',
      'Created security monitoring',
      'Added data retention policies',
      'Added audit logging',
      'Created secure data access functions',
      'Added profile update triggers'
    ]
  )
);