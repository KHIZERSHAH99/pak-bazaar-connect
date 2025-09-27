-- Fix signup issue: Add RLS policy to allow public phone number existence checks
-- This is needed for the signup process to verify if a phone number is already registered

-- Create a policy that allows anyone to check if a phone number exists (without exposing other data)
CREATE POLICY "public_check_phone_exists" ON public.profiles
FOR SELECT 
USING (true);

-- But we need to be more secure - let's drop that and create a better approach
DROP POLICY IF EXISTS "public_check_phone_exists" ON public.profiles;

-- Create a secure function to check if phone exists
CREATE OR REPLACE FUNCTION public.check_phone_exists(p_phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  phone_exists boolean;
  normalized_phone text;
BEGIN
  -- Normalize the phone number
  normalized_phone := normalize_pakistani_phone(p_phone);
  
  -- Check if phone exists
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE phone_number = p_phone 
       OR phone_number = normalized_phone
       OR normalized_phone = profiles.normalized_phone
  ) INTO phone_exists;
  
  RETURN phone_exists;
END;
$function$;

-- Grant execute permission to anon users for signup checks
GRANT EXECUTE ON FUNCTION public.check_phone_exists(text) TO anon;

-- Also ensure the check_user_exists function works for anon users
GRANT EXECUTE ON FUNCTION public.check_user_exists(text, text) TO anon;

-- Ensure the normalize_pakistani_phone function is accessible
GRANT EXECUTE ON FUNCTION public.normalize_pakistani_phone(text) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_pakistani_phone(text) TO anon;