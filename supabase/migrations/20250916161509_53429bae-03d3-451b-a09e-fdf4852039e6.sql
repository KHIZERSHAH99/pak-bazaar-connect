-- Fix authentication and security issues (simplified)

-- 1. Create a function to find user by phone (for authentication)
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

-- 2. Fix RLS policies for products to avoid recursion
DROP POLICY IF EXISTS "Public products are accessible for active shops" ON public.products;

CREATE POLICY "Public products are accessible" 
ON public.products 
FOR SELECT 
USING (is_active = true);

-- 3. Fix RLS policies for shops
DROP POLICY IF EXISTS "Public shops accessible to all" ON public.shops;

CREATE POLICY "Public shops accessible" 
ON public.shops 
FOR SELECT 
USING (is_active = true);

-- 4. Ensure audit_logs insert policy doesn't block operations
DROP POLICY IF EXISTS "audit_system_insert" ON public.audit_logs;

CREATE POLICY "audit_system_insert" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- 5. Add indexes for faster auth lookups
CREATE INDEX IF NOT EXISTS idx_profiles_normalized_phone ON public.profiles(normalized_phone);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON public.profiles(phone_number);