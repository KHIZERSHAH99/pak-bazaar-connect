-- Fix phone login by associating phone with admin account and improving error handling
BEGIN;

-- 1) Add phone number to admin account (khizerfight@gmail.com)
UPDATE public.profiles 
SET phone_number = '03001234568',
    normalized_phone = '03001234568',
    updated_at = now()
WHERE email = 'khizerfight@gmail.com' 
  AND (phone_number IS NULL OR phone_number = '');

-- 2) Add function to associate phone with existing email accounts
CREATE OR REPLACE FUNCTION public.associate_phone_with_account(
  p_email text,
  p_phone_number text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  normalized_phone text;
  user_record RECORD;
BEGIN
  -- Normalize the phone number
  normalized_phone := public.normalize_pakistani_phone(p_phone_number);
  
  -- Validate Pakistani phone number
  IF NOT public.validate_pakistani_phone(normalized_phone) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid Pakistani phone number format');
  END IF;
  
  -- Check if phone already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE normalized_phone = normalized_phone) THEN
    RETURN jsonb_build_object('success', false, 'error', 'This phone number is already associated with another account');
  END IF;
  
  -- Find user by email
  SELECT * INTO user_record FROM public.profiles WHERE email = p_email;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'No account found with this email');
  END IF;
  
  -- Update the profile with phone number
  UPDATE public.profiles 
  SET phone_number = normalized_phone,
      normalized_phone = normalized_phone,
      updated_at = now()
  WHERE id = user_record.id;
  
  -- Log the association
  INSERT INTO public.audit_logs (user_id, event_type, table_name, record_id, new_values)
  VALUES (
    user_record.id,
    'phone_associated',
    'profiles',
    user_record.id,
    jsonb_build_object('phone', normalized_phone, 'email', p_email)
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Phone number successfully associated with account');
END;
$$;

-- 3) Add function to get available phone numbers for debugging
CREATE OR REPLACE FUNCTION public.get_available_phones()
RETURNS TABLE(phone_number text, normalized_phone text, email text, role text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT p.phone_number, p.normalized_phone, p.email, p.role
  FROM public.profiles p
  WHERE p.normalized_phone IS NOT NULL
  ORDER BY p.created_at DESC;
END;
$$;

COMMIT;