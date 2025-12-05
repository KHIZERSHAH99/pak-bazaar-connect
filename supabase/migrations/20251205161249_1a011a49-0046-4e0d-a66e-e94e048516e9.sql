-- First, drop the overly permissive public access policies
DROP POLICY IF EXISTS "Anyone can view shops" ON public.shops;
DROP POLICY IF EXISTS "Public can view all shops" ON public.shops;

-- Create a public view with only safe columns for unauthenticated browsing
CREATE OR REPLACE VIEW public.shops_public AS
SELECT 
  id,
  name,
  logo,
  city_id,
  created_at
FROM public.shops;

-- Grant public access to the view
GRANT SELECT ON public.shops_public TO anon;
GRANT SELECT ON public.shops_public TO authenticated;

-- Create a security definer function to get public shop info
CREATE OR REPLACE FUNCTION public.get_public_shop_info(p_shop_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  logo text,
  city_id uuid,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.name, s.logo, s.city_id, s.created_at
  FROM public.shops s
  WHERE s.id = p_shop_id;
$$;

-- Create new RLS policies for the base shops table

-- Policy 1: Authenticated users can view all shops (they need contact info for ordering)
CREATE POLICY "Authenticated users can view all shops"
ON public.shops
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Anonymous users cannot view the base table (they should use shops_public view)
-- This is implicit - no anon SELECT policy means no access

-- Policy 3: Shop owners can manage their own shops (already exists but recreate for completeness)
DROP POLICY IF EXISTS "Wholesalers can manage their own shops" ON public.shops;
CREATE POLICY "Shop owners can manage their own shops"
ON public.shops
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Policy 4: Admin can manage all shops
DROP POLICY IF EXISTS "Admin can manage all shops" ON public.shops;
CREATE POLICY "Admin can manage all shops"
ON public.shops
FOR ALL
TO authenticated
USING (get_user_role() = 'admin')
WITH CHECK (get_user_role() = 'admin');

-- Add comments explaining the security model
COMMENT ON VIEW public.shops_public IS 
'Public-safe view of shops table. Only exposes id, name, logo, and city_id. Use this for unauthenticated shop browsing.';

COMMENT ON FUNCTION public.get_public_shop_info IS 
'Security definer function to get public-safe shop information. Returns only non-sensitive fields.';