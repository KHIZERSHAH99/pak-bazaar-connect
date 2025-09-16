-- Fix authentication by creating simpler policies and functions

-- 1. Update authentication function to avoid RLS issues
CREATE OR REPLACE FUNCTION public.get_user_by_phone(phone_input text)
RETURNS table(user_email text, user_role text)
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
GRANT EXECUTE ON FUNCTION public.get_user_by_phone TO anon, authenticated;