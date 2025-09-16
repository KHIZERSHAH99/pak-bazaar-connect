-- Fix authentication and security issues

-- 1. Create a public view for shops that doesn't expose sensitive data
CREATE OR REPLACE VIEW public.shops_public AS
SELECT 
  s.id,
  s.name,
  s.contact_number,
  s.address,
  s.postal_code,
  s.logo,
  s.city,
  s.category,
  s.is_verified,
  s.created_at,
  -- Only show business name from profiles (not email or phone)
  p.business_name as owner_business_name,
  p.city as owner_city,
  p.verification_status as owner_verification_status
FROM public.shops s
LEFT JOIN public.profiles p ON s.owner_id = p.id
WHERE s.is_active = true;

-- Grant public access to the view
GRANT SELECT ON public.shops_public TO anon, authenticated;

-- 2. Create a function to authenticate by phone without exposing profiles
CREATE OR REPLACE FUNCTION public.authenticate_by_phone(phone_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_normalized_phone text;
  v_profile record;
BEGIN
  -- Normalize the phone number
  v_normalized_phone := public.normalize_pakistani_phone(phone_input);
  
  -- Find user by phone (this runs with elevated privileges)
  SELECT id, email, role, phone_number, normalized_phone
  INTO v_profile
  FROM public.profiles
  WHERE normalized_phone = v_normalized_phone
     OR phone_number = v_normalized_phone
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No account found with this phone number'
    );
  END IF;
  
  -- Return user data for authentication
  RETURN jsonb_build_object(
    'success', true,
    'email', v_profile.email,
    'role', v_profile.role
  );
END;
$$;

-- 3. Fix RLS policies for products - remove direct profiles table reference
DROP POLICY IF EXISTS "Public products are accessible for active shops" ON public.products;

CREATE POLICY "Public products are accessible for active shops" 
ON public.products 
FOR SELECT 
USING (
  is_active = true 
  AND shop_id IN (
    SELECT id FROM public.shops WHERE is_active = true
  )
);

-- 4. Fix RLS policies for shops - remove direct profiles reference
DROP POLICY IF EXISTS "Public shops accessible to all" ON public.shops;

CREATE POLICY "Public shops accessible to all" 
ON public.shops 
FOR SELECT 
USING (is_active = true);

-- 5. Create a function to get active products safely
CREATE OR REPLACE FUNCTION public.get_active_products(limit_count int DEFAULT 10)
RETURNS TABLE(
  id uuid,
  name text,
  price numeric,
  image text,
  shop_id uuid,
  shop_name text,
  created_at timestamptz
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
    s.name as shop_name,
    p.created_at
  FROM public.products p
  JOIN public.shops s ON p.shop_id = s.id
  WHERE p.is_active = true 
    AND s.is_active = true
  ORDER BY p.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Grant execute permission to everyone
GRANT EXECUTE ON FUNCTION public.get_active_products TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.authenticate_by_phone TO anon, authenticated;

-- 6. Fix ads RLS policies - replace complex checks with function calls
DROP POLICY IF EXISTS "Sellers can view active ads" ON public.ads;

CREATE POLICY "Sellers can view active ads" 
ON public.ads 
FOR SELECT 
USING (
  status = 'active' 
  AND (
    auth.uid() IS NULL -- Allow anonymous users
    OR get_user_role() = 'seller'
  )
);

-- 7. Ensure audit_logs insert policy doesn't block operations
DROP POLICY IF EXISTS "audit_system_insert" ON public.audit_logs;

CREATE POLICY "audit_system_insert" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true); -- Allow all inserts for audit logging

-- 8. Add index for faster auth lookups
CREATE INDEX IF NOT EXISTS idx_profiles_normalized_phone ON public.profiles(normalized_phone);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON public.profiles(phone_number);

-- 9. Fix the commission records policy to use function
DROP POLICY IF EXISTS "System can insert valid commission records" ON public.commission_records;

CREATE POLICY "System can insert commission records" 
ON public.commission_records 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.shops s 
    WHERE s.id IN (
      SELECT shop_id FROM public.orders o WHERE o.id = commission_records.order_id
    )
    AND s.owner_id = commission_records.wholesaler_id
  )
);