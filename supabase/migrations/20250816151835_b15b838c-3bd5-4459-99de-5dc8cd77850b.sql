-- Fix phone authentication data storage issues

-- First, let's update the signUpWithPhone to properly store phone numbers
-- We need to ensure the auth.users table gets the phone number in the phone field

-- Create a function to handle phone-based user creation properly
CREATE OR REPLACE FUNCTION public.create_phone_user(
  p_phone text,
  p_password text,
  p_role text,
  p_business_data jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_normalized_phone text;
  v_user_id uuid;
  v_unique_email text;
BEGIN
  -- Normalize phone number
  v_normalized_phone := public.normalize_pakistani_phone(p_phone);
  
  -- Validate phone number
  IF NOT public.validate_pakistani_phone(v_normalized_phone) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid Pakistani phone number');
  END IF;
  
  -- Check if phone already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE normalized_phone = v_normalized_phone) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Phone number already registered');
  END IF;
  
  -- Generate unique email for auth system
  v_unique_email := v_normalized_phone || '@phone.auth.local';
  
  -- Generate user ID
  v_user_id := gen_random_uuid();
  
  -- Create profile entry with proper phone data
  INSERT INTO public.profiles (
    id,
    email,
    phone_number,
    normalized_phone,
    role,
    contact_name,
    business_name,
    business_type,
    address,
    city,
    postal_code,
    industry,
    years_in_business
  ) VALUES (
    v_user_id,
    v_unique_email,
    v_normalized_phone,
    v_normalized_phone,
    p_role,
    COALESCE(p_business_data->>'contactName', 'User'),
    COALESCE(p_business_data->>'businessName', 'Business'),
    COALESCE(p_business_data->>'businessType', 'Retailer'),
    COALESCE(p_business_data->>'address', ''),
    COALESCE(p_business_data->>'city', ''),
    COALESCE(p_business_data->>'postalCode', ''),
    COALESCE(p_business_data->>'industry', ''),
    COALESCE(p_business_data->>'yearsInBusiness', '1-3 years')
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', v_unique_email,
    'phone', v_normalized_phone
  );
END;
$$;

-- Create a function to clean up existing phone-based users
CREATE OR REPLACE FUNCTION public.cleanup_phone_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Update profiles where email contains phone numbers to fix the data
  UPDATE public.profiles 
  SET 
    phone_number = CASE 
      WHEN email LIKE '%@temp-phone-auth.com' THEN 
        REPLACE(email, '@temp-phone-auth.com', '')
      WHEN email LIKE '%@phone.auth.local' THEN
        REPLACE(email, '@phone.auth.local', '')
      ELSE phone_number
    END,
    normalized_phone = CASE 
      WHEN email LIKE '%@temp-phone-auth.com' THEN 
        public.normalize_pakistani_phone(REPLACE(email, '@temp-phone-auth.com', ''))
      WHEN email LIKE '%@phone.auth.local' THEN
        public.normalize_pakistani_phone(REPLACE(email, '@phone.auth.local', ''))
      ELSE normalized_phone
    END
  WHERE email LIKE '%@temp-phone-auth.com' 
     OR email LIKE '%@phone.auth.local';
     
  -- Log the cleanup
  INSERT INTO public.audit_logs (user_id, event_type, table_name, new_values)
  VALUES (
    NULL,
    'phone_data_cleanup',
    'profiles',
    jsonb_build_object(
      'action', 'cleaned_phone_user_data',
      'timestamp', now()
    )
  );
END;
$$;

-- Run the cleanup function
SELECT public.cleanup_phone_users();