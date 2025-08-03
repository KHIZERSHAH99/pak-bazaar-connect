-- Add unique constraints for email and phone number
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_email_unique UNIQUE (email);

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_phone_number_unique UNIQUE (phone_number);

-- Create function to check for existing email/phone before signup
CREATE OR REPLACE FUNCTION public.check_user_exists(
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  email_exists boolean := false;
  phone_exists boolean := false;
BEGIN
  -- Check if email exists
  IF p_email IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.profiles WHERE email = p_email
    ) INTO email_exists;
  END IF;
  
  -- Check if phone exists
  IF p_phone IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.profiles WHERE phone_number = p_phone
    ) INTO phone_exists;
  END IF;
  
  RETURN jsonb_build_object(
    'email_exists', email_exists,
    'phone_exists', phone_exists
  );
END;
$$;