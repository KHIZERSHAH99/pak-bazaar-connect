-- Drop existing function first
DROP FUNCTION IF EXISTS public.mask_sensitive_data(text, text);

-- PHASE 1: CRITICAL SECURITY FIXES
-- Protecting exposed customer data, payment information, and financial records

-- 1. FIX ORDERS TABLE EXPOSURE
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Admin can select all orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers view own orders only" ON public.orders;
DROP POLICY IF EXISTS "Wholesalers view shop orders only" ON public.orders;
DROP POLICY IF EXISTS "Admin view all orders" ON public.orders;
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
DROP POLICY IF EXISTS "Admin view payment methods" ON public.payment_methods;

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
DROP POLICY IF EXISTS "Wholesalers view own commissions only" ON public.commission_records;
DROP POLICY IF EXISTS "Admin manage all commissions" ON public.commission_records;

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
DROP POLICY IF EXISTS "Wholesalers view own commission transactions" ON public.commission_transactions;

CREATE POLICY "Wholesalers view own commission transactions" 
ON public.commission_transactions 
FOR SELECT 
USING (wholesaler_id = auth.uid());

-- Fix monthly_commissions policies
DROP POLICY IF EXISTS "Wholesalers can view their commissions" ON public.monthly_commissions;
DROP POLICY IF EXISTS "Wholesalers view own monthly commissions" ON public.monthly_commissions;

CREATE POLICY "Wholesalers view own monthly commissions" 
ON public.monthly_commissions 
FOR SELECT 
USING (wholesaler_id = auth.uid());

-- 4. SECURE USER PROFILES
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can view profiles for display purposes" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin view all profiles" ON public.profiles;

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
DROP VIEW IF EXISTS public.public_wholesaler_profiles;
CREATE VIEW public.public_wholesaler_profiles AS
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
DROP POLICY IF EXISTS "Admin only view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System insert audit logs" ON public.audit_logs;

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
DROP POLICY IF EXISTS "Admin only view auth attempts" ON public.auth_attempts;

CREATE POLICY "Admin only view auth attempts" 
ON public.auth_attempts 
FOR SELECT 
USING (get_user_role() = 'admin');

-- 6. CREATE SECURE ORDER VIEW FOR BUYERS
DROP VIEW IF EXISTS public.my_orders;
CREATE VIEW public.my_orders AS
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
  s.phone as shop_phone
FROM public.orders o
LEFT JOIN public.shops s ON o.shop_id = s.id
WHERE o.buyer_id = auth.uid();

-- 7. FIX CSRF TOKEN POLICIES
DROP POLICY IF EXISTS "csrf_tokens_own" ON public.csrf_tokens;
DROP POLICY IF EXISTS "Users manage own CSRF tokens" ON public.csrf_tokens;

CREATE POLICY "Users manage own CSRF tokens" 
ON public.csrf_tokens 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 8. SECURE SHOPS TABLE
-- Add missing RLS policies for shops
DROP POLICY IF EXISTS "Public can view active shops" ON public.shops;
DROP POLICY IF EXISTS "Wholesalers can view all shops" ON public.shops;

CREATE POLICY "Anyone can view active shops" 
ON public.shops 
FOR SELECT 
USING (is_active = true);

-- 9. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created 
ON public.audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id 
ON public.orders(buyer_id);

CREATE INDEX IF NOT EXISTS idx_orders_shop_id 
ON public.orders(shop_id);

CREATE INDEX IF NOT EXISTS idx_commission_records_wholesaler
ON public.commission_records(wholesaler_id);

-- 10. Final security check: Ensure RLS is enabled on all tables
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