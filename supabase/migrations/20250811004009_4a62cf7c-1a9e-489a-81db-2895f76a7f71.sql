-- Create a secure function for phone-based user lookup during authentication
CREATE OR REPLACE FUNCTION public.authenticate_user_by_phone(user_phone text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_record RECORD;
  normalized_phone text;
BEGIN
  -- Normalize the phone number
  normalized_phone := public.normalize_pakistani_phone(user_phone);
  
  -- Find user by normalized phone number
  SELECT id, email, role, phone_number, normalized_phone
  INTO user_record
  FROM public.profiles
  WHERE normalized_phone = public.normalize_pakistani_phone(user_phone)
     OR phone_number = user_phone
     OR phone_number = normalized_phone
  LIMIT 1;
  
  -- If user not found, return error
  IF NOT FOUND THEN
    -- Log failed authentication attempt
    INSERT INTO public.audit_logs (user_id, event_type, table_name, new_values)
    VALUES (
      NULL,
      'auth_failed_no_user',
      'profiles',
      jsonb_build_object('phone', user_phone, 'normalized', normalized_phone)
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No account found with this phone number',
      'phone_searched', user_phone,
      'normalized_phone', normalized_phone
    );
  END IF;
  
  -- Log successful user lookup
  INSERT INTO public.audit_logs (user_id, event_type, table_name, new_values)
  VALUES (
    user_record.id,
    'auth_user_found',
    'profiles',
    jsonb_build_object('phone', user_phone, 'user_id', user_record.id)
  );
  
  -- Return user data for authentication
  RETURN jsonb_build_object(
    'success', true,
    'user_id', user_record.id,
    'email', user_record.email,
    'role', user_record.role,
    'phone_number', user_record.phone_number
  );
END;
$$;