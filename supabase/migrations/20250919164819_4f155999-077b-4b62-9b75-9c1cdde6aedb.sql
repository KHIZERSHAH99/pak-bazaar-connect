-- PHASE 1: CRITICAL SECURITY FIXES
-- Protecting exposed customer data, payment information, and financial records

-- 1. FIX ORDERS TABLE EXPOSURE
-- Drop ALL existing policies on orders first
DROP POLICY IF EXISTS "Admin can select all orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers view own orders only" ON public.orders;
DROP POLICY IF EXISTS "Wholesalers view shop orders only" ON public.orders;
DROP POLICY IF EXISTS "Admin view all orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers can see their own orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers can view orders for their shops" ON public.orders;
DROP POLICY IF EXISTS "Wholesalers can see orders for their shops" ON public.orders;
DROP POLICY IF EXISTS "Wholesalers can update order status" ON public.orders;
DROP POLICY IF EXISTS "Order participants can update orders" ON public.orders;
DROP POLICY IF EXISTS "order_participants_view_only" ON public.orders;
DROP POLICY IF EXISTS "authenticated_users_create_orders" ON public.orders;

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

-- 2. SECURE PAYMENT METHODS TABLE
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

DROP POLICY IF EXISTS "Wholesalers manage own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Admin view payment methods" ON public.payment_methods;

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
DROP POLICY IF EXISTS "Restrict commission records access" ON public.commission_records;
DROP POLICY IF EXISTS "Wholesalers can view their commission records" ON public.commission_records;
DROP POLICY IF EXISTS "Wholesalers view own commissions only" ON public.commission_records;
DROP POLICY IF EXISTS "Admin manage all commissions" ON public.commission_records;
DROP POLICY IF EXISTS "Wholesalers can insert their commission records" ON public.commission_records;
DROP POLICY IF EXISTS "System can insert valid commission records" ON public.commission_records;
DROP POLICY IF EXISTS "Only admins can update commission records" ON public.commission_records;
DROP POLICY IF EXISTS "Admin can manage all commission records" ON public.commission_records;

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
DROP POLICY IF EXISTS "Admin can manage all commissions" ON public.commission_transactions;
DROP POLICY IF EXISTS "Wholesalers can view their commissions" ON public.commission_transactions;
DROP POLICY IF EXISTS "Wholesalers view own commission transactions" ON public.commission_transactions;

CREATE POLICY "Wholesalers view own transactions" 
ON public.commission_transactions 
FOR SELECT 
USING (wholesaler_id = auth.uid());

CREATE POLICY "Admin manage all transactions" 
ON public.commission_transactions 
FOR ALL 
USING (get_user_role() = 'admin');

-- monthly_commissions  
DROP POLICY IF EXISTS "Admin can manage all commissions" ON public.monthly_commissions;
DROP POLICY IF EXISTS "Wholesalers can view their commissions" ON public.monthly_commissions;
DROP POLICY IF EXISTS "Wholesalers view own monthly commissions" ON public.monthly_commissions;

CREATE POLICY "Wholesalers view own monthly" 
ON public.monthly_commissions 
FOR SELECT 
USING (wholesaler_id = auth.uid());

CREATE POLICY "Admin manage all monthly" 
ON public.monthly_commissions 
FOR ALL 
USING (get_user_role() = 'admin');

-- 4. SECURE USER PROFILES
DROP POLICY IF EXISTS "Anyone can view profiles for display purposes" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin view all profiles" ON public.profiles;

CREATE POLICY "Users view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admin view all profiles" 
ON public.profiles 
FOR SELECT 
USING (get_user_role() = 'admin');

-- Create view for public wholesaler data
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
-- audit_logs
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

-- auth_attempts
DROP POLICY IF EXISTS "auth_attempts_admin_only" ON public.auth_attempts;
DROP POLICY IF EXISTS "Admin only view auth attempts" ON public.auth_attempts;

CREATE POLICY "Admin only view auth attempts" 
ON public.auth_attempts 
FOR SELECT 
USING (get_user_role() = 'admin');

-- 6. CREATE SECURE ORDER VIEW
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
  s.contact as shop_contact
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
DROP POLICY IF EXISTS "Public can view active shops" ON public.shops;
DROP POLICY IF EXISTS "Wholesalers can view all shops" ON public.shops;
DROP POLICY IF EXISTS "Anyone can view active shops" ON public.shops;

CREATE POLICY "Anyone can view active shops" 
ON public.shops 
FOR SELECT 
USING (is_active = true);

-- 9. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created 
ON public.audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id 
ON public.orders(buyer_id);

CREATE INDEX IF NOT EXISTS idx_orders_shop_id 
ON public.orders(shop_id);

CREATE INDEX IF NOT EXISTS idx_commission_records_wholesaler
ON public.commission_records(wholesaler_id);

-- 10. Enable RLS on all tables
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
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;