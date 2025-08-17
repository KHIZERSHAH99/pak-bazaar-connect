-- Fix missing get_user_role function and implement comprehensive phone cleanup

-- First, create the missing get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT COALESCE(role, 'pending') FROM public.profiles WHERE id = auth.uid();
$function$;

-- Now proceed with the comprehensive phone data cleanup

-- Step 1: Extract and fix phone numbers from fake email addresses
UPDATE public.profiles 
SET 
  phone_number = CASE 
    WHEN email LIKE '%@temp-phone-auth.com' THEN REPLACE(email, '@temp-phone-auth.com', '')
    WHEN email LIKE '%@phone.auth.local' THEN REPLACE(email, '@phone.auth.local', '')
    ELSE phone_number
  END,
  normalized_phone = public.normalize_pakistani_phone(
    CASE 
      WHEN email LIKE '%@temp-phone-auth.com' THEN REPLACE(email, '@temp-phone-auth.com', '')
      WHEN email LIKE '%@phone.auth.local' THEN REPLACE(email, '@phone.auth.local', '')
      ELSE phone_number
    END
  )
WHERE email LIKE '%@temp-phone-auth.com' OR email LIKE '%@phone.auth.local';

-- Step 2: Normalize all existing phone numbers to ensure consistency
UPDATE public.profiles 
SET normalized_phone = public.normalize_pakistani_phone(phone_number)
WHERE phone_number IS NOT NULL AND (normalized_phone IS NULL OR normalized_phone != public.normalize_pakistani_phone(phone_number));

-- Step 3: Fix demo users to have consistent formatting
UPDATE public.profiles 
SET 
  phone_number = public.normalize_pakistani_phone(phone_number),
  normalized_phone = public.normalize_pakistani_phone(phone_number)
WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'd63c9b0a-b0e8-4fec-bfcf-5aa876ffe504')
  AND phone_number IS NOT NULL;

-- Step 4: Replace the old authenticate_user_by_phone function with enhanced version
CREATE OR REPLACE FUNCTION public.authenticate_user_by_phone(user_phone text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  user_record RECORD;
  v_normalized_phone text;
  v_clean_phone text;
BEGIN
  -- Normalize the phone number using our utility function
  v_normalized_phone := public.normalize_pakistani_phone(user_phone);
  
  -- Also try to clean the input phone for additional matching
  v_clean_phone := regexp_replace(user_phone, '[^0-9]', '', 'g');
  
  -- Find user by multiple phone matching strategies
  SELECT p.id, p.email, p.role, p.phone_number, p.normalized_phone
  INTO user_record
  FROM public.profiles p
  WHERE p.normalized_phone = v_normalized_phone
     OR p.phone_number = user_phone
     OR p.phone_number = v_normalized_phone
     OR p.normalized_phone = v_clean_phone
     OR p.phone_number = v_clean_phone
     -- Handle cases where phone is stored with different formatting
     OR p.normalized_phone = ('0' || v_clean_phone)
     OR (v_clean_phone ~ '^03[0-9]{9}$' AND p.normalized_phone = v_clean_phone)
  LIMIT 1;
  
  -- If user not found, try additional fallback searches for legacy data
  IF NOT FOUND THEN
    -- Try searching for phone number extracted from fake emails
    SELECT p.id, p.email, p.role, p.phone_number, p.normalized_phone
    INTO user_record
    FROM public.profiles p
    WHERE (p.email LIKE ('%' || user_phone || '@temp-phone-auth.com'))
       OR (p.email LIKE ('%' || v_normalized_phone || '@temp-phone-auth.com'))
       OR (p.email LIKE ('%' || v_clean_phone || '@temp-phone-auth.com'))
       OR (p.email LIKE ('%' || user_phone || '@phone.auth.local'))
       OR (p.email LIKE ('%' || v_normalized_phone || '@phone.auth.local'))
       OR (p.email LIKE ('%' || v_clean_phone || '@phone.auth.local'))
    LIMIT 1;
  END IF;
  
  -- If still not found, return detailed error
  IF NOT FOUND THEN
    -- Log failed authentication attempt with details
    INSERT INTO public.audit_logs (user_id, event_type, table_name, new_values)
    VALUES (
      NULL,
      'auth_failed_no_user_detailed',
      'profiles',
      jsonb_build_object(
        'input_phone', user_phone, 
        'normalized_phone', v_normalized_phone,
        'clean_phone', v_clean_phone,
        'search_timestamp', now()
      )
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No account found with this phone number'
    );
  END IF;
  
  -- Log successful user lookup with details
  INSERT INTO public.audit_logs (user_id, event_type, table_name, new_values)
  VALUES (
    user_record.id,
    'auth_user_found_enhanced',
    'profiles',
    jsonb_build_object(
      'input_phone', user_phone, 
      'found_user_id', user_record.id,
      'found_phone', user_record.phone_number,
      'found_normalized', user_record.normalized_phone,
      'found_email', user_record.email
    )
  );
  
  -- Return user data for authentication
  RETURN jsonb_build_object(
    'success', true,
    'user_id', user_record.id,
    'email', user_record.email,
    'role', user_record.role,
    'phone_number', user_record.phone_number,
    'normalized_phone', user_record.normalized_phone
  );
END;
$function$;