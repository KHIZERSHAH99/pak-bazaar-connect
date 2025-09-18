-- Fix RLS policies to prevent permission denied errors

-- 1. Fix products table policies
DROP POLICY IF EXISTS "Admin can manage all products" ON public.products;
DROP POLICY IF EXISTS "Admin can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
DROP POLICY IF EXISTS "Public can view approved products" ON public.products;

-- Create new products policies using get_user_role()
CREATE POLICY "products_public_view" 
ON public.products FOR SELECT 
USING (is_approved = true OR owner_id = auth.uid() OR get_user_role() = 'admin');

CREATE POLICY "products_owner_insert" 
ON public.products FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "products_owner_update" 
ON public.products FOR UPDATE 
USING (auth.uid() = owner_id OR get_user_role() = 'admin');

CREATE POLICY "products_owner_delete" 
ON public.products FOR DELETE 
USING (auth.uid() = owner_id OR get_user_role() = 'admin');

-- 2. Fix shops table policies
DROP POLICY IF EXISTS "Admins can manage all shops" ON public.shops;
DROP POLICY IF EXISTS "Admins can update shops" ON public.shops;
DROP POLICY IF EXISTS "Admins can view all shops" ON public.shops;

-- Create new shops policies using get_user_role()
CREATE POLICY "shops_public_view" 
ON public.shops FOR SELECT 
USING (true);

CREATE POLICY "shops_owner_manage" 
ON public.shops FOR ALL 
USING (auth.uid() = owner_id OR get_user_role() = 'admin')
WITH CHECK (auth.uid() = owner_id OR get_user_role() = 'admin');

-- 3. Fix ads table policies
DROP POLICY IF EXISTS "Admin can update all ads" ON public.ads;
DROP POLICY IF EXISTS "Admin can view all ads" ON public.ads;
DROP POLICY IF EXISTS "Admins can update ads" ON public.ads;
DROP POLICY IF EXISTS "Admins can view all ads" ON public.ads;

-- Create new ads policies using get_user_role()
CREATE POLICY "ads_admin_view" 
ON public.ads FOR SELECT 
USING (
  wholesaler_id = auth.uid() OR 
  get_user_role() = 'admin' OR 
  (status = 'active' AND get_user_role() = 'seller')
);

CREATE POLICY "ads_admin_manage" 
ON public.ads FOR UPDATE 
USING (wholesaler_id = auth.uid() OR get_user_role() = 'admin');

-- 4. Lock down the risky view
REVOKE ALL ON public.orders_with_safe_profiles FROM anon, authenticated;

-- 5. Ensure profiles table has proper policies for authentication
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
CREATE POLICY "profiles_read_own" 
ON public.profiles FOR SELECT 
USING (id = auth.uid() OR get_user_role() = 'admin');

-- 6. Create a simpler function for getting active products
CREATE OR REPLACE FUNCTION public.get_active_products()
RETURNS TABLE(
  id uuid,
  name text,
  price numeric,
  image text,
  shop_id uuid,
  is_active boolean,
  is_approved boolean,
  moq integer,
  shop_name text,
  shop_logo text,
  wholesaler_email text,
  wholesaler_role text
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
    p.is_approved,
    p.moq,
    s.name as shop_name,
    s.logo as shop_logo,
    prof.email as wholesaler_email,
    prof.role::text as wholesaler_role
  FROM public.products p
  JOIN public.shops s ON p.shop_id = s.id
  JOIN public.profiles prof ON s.owner_id = prof.id
  WHERE p.is_active = true 
    AND p.is_approved = true
    AND prof.role = 'wholesaler'
  ORDER BY p.created_at DESC
  LIMIT 100;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_active_products TO anon, authenticated;

-- 7. Fix commission_summary_secure view access
GRANT SELECT ON public.commission_summary_secure TO authenticated;