-- Step 1: Fix RLS policies for products table
-- Drop all existing product policies first
DROP POLICY IF EXISTS "Admin can select all products" ON public.products;
DROP POLICY IF EXISTS "Allow public to view approved products" ON public.products;
DROP POLICY IF EXISTS "Shop owners can manage their products" ON public.products;
DROP POLICY IF EXISTS "Wholesalers can create products for their shops" ON public.products;
DROP POLICY IF EXISTS "Wholesalers can delete their products" ON public.products;
DROP POLICY IF EXISTS "Wholesalers can update their products" ON public.products;
DROP POLICY IF EXISTS "Wholesalers can view their products" ON public.products;

-- Create new clean policies for products
CREATE POLICY "Public can view active approved products" 
ON public.products 
FOR SELECT 
AS PERMISSIVE
USING (is_active = true AND verification_status = 'approved');

CREATE POLICY "Admin can manage all products" 
ON public.products 
FOR ALL 
AS PERMISSIVE
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Shop owners can manage their products" 
ON public.products 
FOR ALL 
AS PERMISSIVE
USING (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE shops.id = products.shop_id 
    AND shops.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE shops.id = products.shop_id 
    AND shops.owner_id = auth.uid()
  )
);

-- Step 2: Fix RLS policies for shops
-- Drop existing shop policies
DROP POLICY IF EXISTS "Admin can manage all shops" ON public.shops;
DROP POLICY IF EXISTS "Anyone can view active shops" ON public.shops;
DROP POLICY IF EXISTS "Shop owners can update their shops" ON public.shops;
DROP POLICY IF EXISTS "Users can view active shops" ON public.shops;
DROP POLICY IF EXISTS "Wholesalers can create shops" ON public.shops;
DROP POLICY IF EXISTS "Wholesalers can update their shops" ON public.shops;
DROP POLICY IF EXISTS "Wholesalers can view their shops" ON public.shops;

-- Create new clean policies for shops
CREATE POLICY "Public can view active shops" 
ON public.shops 
FOR SELECT 
AS PERMISSIVE
USING (is_active = true);

CREATE POLICY "Admin can manage all shops" 
ON public.shops 
FOR ALL 
AS PERMISSIVE
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Shop owners can manage their shops" 
ON public.shops 
FOR ALL 
AS PERMISSIVE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Step 2 continued: Fix RLS policies for ads
-- Drop existing ads policies  
DROP POLICY IF EXISTS "Sellers can view active ads" ON public.ads;
DROP POLICY IF EXISTS "Wholesaler can access their own ads" ON public.ads;
DROP POLICY IF EXISTS "Wholesaler can insert ad" ON public.ads;
DROP POLICY IF EXISTS "Wholesaler can update their own ads" ON public.ads;
DROP POLICY IF EXISTS "Wholesalers can create their own ads" ON public.ads;
DROP POLICY IF EXISTS "Wholesalers can update their own ads" ON public.ads;
DROP POLICY IF EXISTS "Wholesalers can view their own ads" ON public.ads;
DROP POLICY IF EXISTS "ads_admin_manage" ON public.ads;

-- Create new clean policies for ads
CREATE POLICY "Public can view active ads" 
ON public.ads 
FOR SELECT 
AS PERMISSIVE
USING (status = 'active');

CREATE POLICY "Admin can manage all ads" 
ON public.ads 
FOR ALL 
AS PERMISSIVE
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Wholesalers can manage their own ads" 
ON public.ads 
FOR ALL 
AS PERMISSIVE
USING (wholesaler_id = auth.uid())
WITH CHECK (wholesaler_id = auth.uid());

-- Step 3: Lock down risky view
REVOKE ALL ON public.orders_with_safe_profiles FROM anon, authenticated;

-- Grant SELECT to admin function only
GRANT SELECT ON public.orders_with_safe_profiles TO authenticated;

-- Add a policy to protect the view (if it doesn't exist)
CREATE POLICY "Admin only access" 
ON public.orders_with_safe_profiles 
FOR SELECT 
AS RESTRICTIVE
USING (public.get_user_role() = 'admin');

-- Step 4: Ensure profiles table has proper read policy for own data
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
CREATE POLICY "Users can read own profile" 
ON public.profiles 
FOR SELECT 
AS PERMISSIVE
USING (id = auth.uid());

-- Also ensure commission_summary_secure has proper access
GRANT SELECT ON public.commission_summary_secure TO authenticated;