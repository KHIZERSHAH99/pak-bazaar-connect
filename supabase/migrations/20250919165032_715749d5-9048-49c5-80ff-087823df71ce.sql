-- PHASE 1: CRITICAL SECURITY FIXES - FINAL ATTEMPT
-- Protecting exposed customer data, payment information, and financial records

-- 1. FIX ORDERS TABLE EXPOSURE
-- Drop ALL existing policies on orders
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'orders' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', pol.policyname);
  END LOOP;
END $$;

-- Create secure policies for orders
CREATE POLICY "Buyers view own orders" 
ON public.orders FOR SELECT 
USING (
  auth.uid() = buyer_id 
  AND buyer_id != '00000000-0000-0000-0000-000000000000'
);

CREATE POLICY "Wholesalers view shop orders" 
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

CREATE POLICY "Authenticated users create orders" 
ON public.orders FOR INSERT 
WITH CHECK (
  (auth.uid() = buyer_id AND buyer_id != '00000000-0000-0000-0000-000000000000') 
  OR (buyer_id = '00000000-0000-0000-0000-000000000000' AND is_guest_order = true)
);

CREATE POLICY "Order participants update orders" 
ON public.orders FOR UPDATE 
USING (
  (auth.uid() = buyer_id AND buyer_id != '00000000-0000-0000-0000-000000000000') 
  OR EXISTS (
    SELECT 1 FROM public.shops 
    WHERE shops.id = orders.shop_id 
    AND shops.owner_id = auth.uid()
  )
  OR get_user_role() = 'admin'
);

-- 2. SECURE PAYMENT METHODS
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wholesaler_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name TEXT,
  account_number TEXT,
  account_title TEXT,
  jazzcash_number TEXT,
  easypaisa_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'payment_methods' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.payment_methods', pol.policyname);
  END LOOP;
END $$;

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
-- commission_records
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'commission_records' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.commission_records', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Wholesalers view own commissions" 
ON public.commission_records 
FOR SELECT 
USING (wholesaler_id = auth.uid());

CREATE POLICY "Admin manage all commission records" 
ON public.commission_records 
FOR ALL 
USING (get_user_role() = 'admin');

CREATE POLICY "System insert commissions" 
ON public.commission_records 
FOR INSERT 
WITH CHECK (true);

-- commission_transactions
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'commission_transactions' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.commission_transactions', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Wholesalers view own transactions" 
ON public.commission_transactions 
FOR SELECT 
USING (wholesaler_id = auth.uid());

CREATE POLICY "Admin manage all transactions" 
ON public.commission_transactions 
FOR ALL 
USING (get_user_role() = 'admin');

-- monthly_commissions
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'monthly_commissions' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.monthly_commissions', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Wholesalers view own monthly" 
ON public.monthly_commissions 
FOR SELECT 
USING (wholesaler_id = auth.uid());

CREATE POLICY "Admin manage all monthly" 
ON public.monthly_commissions 
FOR ALL 
USING (get_user_role() = 'admin');

-- 4. SECURE USER PROFILES
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admin view all profiles" 
ON public.profiles 
FOR SELECT 
USING (get_user_role() = 'admin');

CREATE POLICY "Admin manage all profiles" 
ON public.profiles 
FOR ALL 
USING (get_user_role() = 'admin');

CREATE POLICY "System insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- 5. LOCK DOWN SECURITY LOGS
-- audit_logs
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'audit_logs' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.audit_logs', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Admin only view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (get_user_role() = 'admin');

CREATE POLICY "System insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- auth_attempts
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'auth_attempts' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.auth_attempts', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Admin only view auth attempts" 
ON public.auth_attempts 
FOR SELECT 
USING (get_user_role() = 'admin');

-- 6. SECURE SHOPS TABLE
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'shops' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.shops', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Anyone can view shops" 
ON public.shops 
FOR SELECT 
USING (true);

CREATE POLICY "Wholesalers manage own shops" 
ON public.shops 
FOR ALL 
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- 7. FIX CSRF TOKEN POLICIES
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'csrf_tokens' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.csrf_tokens', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users manage own CSRF tokens" 
ON public.csrf_tokens 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 8. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created 
ON public.audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id 
ON public.orders(buyer_id);

CREATE INDEX IF NOT EXISTS idx_orders_shop_id 
ON public.orders(shop_id);

CREATE INDEX IF NOT EXISTS idx_commission_records_wholesaler
ON public.commission_records(wholesaler_id);

-- 9. Enable RLS on all tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

-- 10. Create secure view for public wholesaler profiles
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