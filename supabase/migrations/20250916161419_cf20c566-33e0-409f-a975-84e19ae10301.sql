-- Fix authentication and security issues (final version)

-- 1. Create a public view for shops that doesn't expose sensitive data
CREATE OR REPLACE VIEW public.shops_public AS
SELECT 
  s.id,
  s.name,
  s.contact,
  s.address,
  s.postal_code,
  s.logo,
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

-- 2. Keep the existing authenticate_by_phone function (already created above)

-- 3. Fix RLS policies for products - already created above

-- 4. Fix RLS policies for shops - already created above

-- 5. Keep the existing get_active_products function (already created above)

-- 6. Keep ads and audit_logs policies as is

-- 7. Update the authentication function to use the new method
CREATE OR REPLACE FUNCTION public.find_user_by_phone(phone_input text)
RETURNS table(email text, role text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_normalized_phone text;
BEGIN
  -- Normalize the phone number
  v_normalized_phone := public.normalize_pakistani_phone(phone_input);
  
  -- Find and return user by phone
  RETURN QUERY
  SELECT p.email, p.role::text
  FROM public.profiles p
  WHERE p.normalized_phone = v_normalized_phone
     OR p.phone_number = v_normalized_phone
  LIMIT 1;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.find_user_by_phone TO anon, authenticated;