-- Tighten products SELECT policies: require approved verification for public visibility
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view active products" ON public.products;

CREATE POLICY "Public can view approved active products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (is_active = true AND verification_status = 'approved');

-- Lock down stock_movements inserts: remove public INSERT policy.
-- SECURITY DEFINER triggers/functions bypass RLS and continue to work.
DROP POLICY IF EXISTS "System insert movements" ON public.stock_movements;