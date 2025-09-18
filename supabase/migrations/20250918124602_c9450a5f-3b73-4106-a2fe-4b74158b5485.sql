-- Comprehensive fix for RLS policies and authentication issues

-- 1. Drop problematic policies on products table
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admin can select all products" ON public.products;

-- 2. Create simpler products policies
CREATE POLICY "products_admin_manage" 
ON public.products FOR ALL 
USING (get_user_role() = 'admin')
WITH CHECK (get_user_role() = 'admin');

-- 3. Fix shops table policies
DROP POLICY IF EXISTS "Admins can manage all shops" ON public.shops;
DROP POLICY IF EXISTS "Admins can update shops" ON public.shops;
DROP POLICY IF EXISTS "Admins can view all shops" ON public.shops;

-- Create simpler shops policies
CREATE POLICY "shops_admin_manage" 
ON public.shops FOR ALL 
USING (get_user_role() = 'admin' OR auth.uid() = owner_id)
WITH CHECK (get_user_role() = 'admin' OR auth.uid() = owner_id);

-- 4. Fix ads table policies
DROP POLICY IF EXISTS "Admin can update all ads" ON public.ads;
DROP POLICY IF EXISTS "Admin can view all ads" ON public.ads;
DROP POLICY IF EXISTS "Admins can update ads" ON public.ads;
DROP POLICY IF EXISTS "Admins can view all ads" ON public.ads;

-- Create simpler ads policies
CREATE POLICY "ads_admin_manage" 
ON public.ads FOR ALL 
USING (get_user_role() = 'admin' OR auth.uid() = wholesaler_id)
WITH CHECK (get_user_role() = 'admin' OR auth.uid() = wholesaler_id);

-- 5. Lock down risky view
REVOKE ALL ON public.orders_with_safe_profiles FROM anon, authenticated;

-- 6. Ensure profiles table has proper policies for authentication
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
CREATE POLICY "profiles_read_own" 
ON public.profiles FOR SELECT 
USING (id = auth.uid() OR get_user_role() = 'admin');

-- 7. Create a function to get active products without RLS issues
CREATE OR REPLACE FUNCTION public.get_active_products_list()
RETURNS TABLE(
  id uuid,
  name text,
  price numeric,
  image text,
  shop_id uuid,
  is_active boolean,
  moq integer,
  shop_name text,
  shop_logo text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.price,
    p.image,
    p.shop_id,
    p.is_active,
    p.moq,
    s.name as shop_name,
    s.logo as shop_logo
  FROM public.products p
  JOIN public.shops s ON p.shop_id = s.id
  WHERE p.is_active = true 
  ORDER BY p.created_at DESC
  LIMIT 100;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_active_products_list TO anon, authenticated;

-- 8. Fix commission_summary_secure view access
GRANT SELECT ON public.commission_summary_secure TO authenticated;