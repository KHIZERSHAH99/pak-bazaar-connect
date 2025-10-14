-- Make shops and products visible to everyone (including non-authenticated users)

-- Update shops RLS policy to allow public viewing of all shops
DROP POLICY IF EXISTS "Public can view shops" ON shops;
CREATE POLICY "Public can view all shops"
ON shops
FOR SELECT
TO authenticated, anon
USING (true);

-- Update products RLS policy to allow public viewing
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Public can view active products"
ON products
FOR SELECT
TO authenticated, anon
USING (is_active = true);

-- Update company_profiles to allow public viewing of approved profiles
DROP POLICY IF EXISTS "Users can view approved company profiles" ON company_profiles;
CREATE POLICY "Public can view approved company profiles"
ON company_profiles
FOR SELECT
TO authenticated, anon
USING (verification_status = 'approved');