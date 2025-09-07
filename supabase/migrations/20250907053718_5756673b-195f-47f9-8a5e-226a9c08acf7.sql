-- Fix function search path security warnings
-- Update all functions to have immutable search_path

-- Fix validate_auth_input function
CREATE OR REPLACE FUNCTION validate_auth_input(input_value text)
RETURNS TABLE(input_type text, normalized_value text, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    clean_input text;
BEGIN
    clean_input := TRIM(input_value);
    
    -- Check if it's an email
    IF clean_input ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$' THEN
        RETURN QUERY SELECT 'email'::text, LOWER(clean_input), NULL::text;
    -- Check if it's a phone number
    ELSIF clean_input ~ '^[\d\s\+\-\(\)]+$' THEN
        -- Normalize Pakistani phone number
        clean_input := regexp_replace(clean_input, '[^0-9]', '', 'g');
        
        -- Handle different phone formats
        IF clean_input ~ '^923\d{9}$' THEN
            -- +92 format
            clean_input := '0' || substring(clean_input from 3);
        ELSIF clean_input ~ '^3\d{9}$' THEN
            -- Missing 0 prefix
            clean_input := '0' || clean_input;
        ELSIF clean_input ~ '^\d{10}$' AND NOT clean_input ~ '^0' THEN
            -- 10 digits without 0
            clean_input := '0' || clean_input;
        END IF;
        
        -- Validate final format
        IF clean_input ~ '^0[3][0-9]{9}$' THEN
            RETURN QUERY SELECT 'phone'::text, clean_input, NULL::text;
        ELSE
            RETURN QUERY SELECT NULL::text, NULL::text, 'Invalid phone number format'::text;
        END IF;
    ELSE
        RETURN QUERY SELECT NULL::text, NULL::text, 'Invalid input format'::text;
    END IF;
END;
$$;

-- Fix authenticate_user_by_phone function
CREATE OR REPLACE FUNCTION authenticate_user_by_phone(phone_number text, user_password text)
RETURNS TABLE(success boolean, user_id uuid, email text, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    normalized_phone text;
    possible_emails text[];
    test_email text;
    found_user_id uuid;
    found_email text;
BEGIN
    -- Normalize the phone number
    normalized_phone := regexp_replace(phone_number, '[^0-9]', '', 'g');
    
    -- Handle different formats
    IF normalized_phone ~ '^923\d{9}$' THEN
        normalized_phone := '0' || substring(normalized_phone from 3);
    ELSIF normalized_phone ~ '^3\d{9}$' THEN
        normalized_phone := '0' || normalized_phone;
    ELSIF normalized_phone ~ '^\d{10}$' AND NOT normalized_phone ~ '^0' THEN
        normalized_phone := '0' || normalized_phone;
    END IF;
    
    -- Define all possible email formats for phone auth
    possible_emails := ARRAY[
        normalized_phone || '@phone.auth',
        normalized_phone || '@temp-phone-auth.com',
        normalized_phone || '@phone-auth.com',
        normalized_phone || '@pakbazaarconnect.store',
        normalized_phone || '@phone.auth.local'
    ];
    
    -- First try to find user by phone in profiles
    SELECT p.id, p.email INTO found_user_id, found_email
    FROM profiles p
    WHERE p.normalized_phone = normalized_phone OR p.phone_number = normalized_phone
    LIMIT 1;
    
    IF found_user_id IS NOT NULL THEN
        -- Check if the auth user exists with this email
        IF EXISTS (
            SELECT 1 FROM auth.users 
            WHERE email = found_email 
            AND id = found_user_id
        ) THEN
            RETURN QUERY SELECT true, found_user_id, found_email, 'User found by profile'::text;
            RETURN;
        END IF;
    END IF;
    
    -- Try each possible email format
    FOREACH test_email IN ARRAY possible_emails
    LOOP
        SELECT id INTO found_user_id
        FROM auth.users
        WHERE email = test_email
        LIMIT 1;
        
        IF found_user_id IS NOT NULL THEN
            RETURN QUERY SELECT true, found_user_id, test_email, 'User found by email'::text;
            RETURN;
        END IF;
    END LOOP;
    
    -- No user found
    RETURN QUERY SELECT false, NULL::uuid, NULL::text, 'User not found'::text;
END;
$$;

-- Fix sync_auth_profiles function
CREATE OR REPLACE FUNCTION sync_auth_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    auth_user RECORD;
    user_phone text;
    user_role text;
BEGIN
    -- Loop through all auth users
    FOR auth_user IN SELECT * FROM auth.users
    LOOP
        -- Extract phone number from metadata or email
        user_phone := COALESCE(
            auth_user.raw_user_meta_data->>'phone_number',
            auth_user.raw_user_meta_data->>'normalized_phone',
            CASE 
                WHEN auth_user.email LIKE '%@phone.auth%' OR 
                     auth_user.email LIKE '%@temp-phone-auth.com%' OR
                     auth_user.email LIKE '%@phone-auth.com%' OR
                     auth_user.email LIKE '%@pakbazaarconnect.store%' OR
                     auth_user.email LIKE '%@phone.auth.local%'
                THEN split_part(auth_user.email, '@', 1)
                ELSE NULL
            END
        );
        
        -- Extract role from metadata
        user_role := COALESCE(
            auth_user.raw_user_meta_data->>'role',
            'seller'
        );
        
        -- Insert or update profile
        INSERT INTO profiles (
            id, 
            email, 
            phone_number, 
            normalized_phone,
            role,
            contact_name,
            business_name,
            business_type,
            created_at,
            updated_at
        ) VALUES (
            auth_user.id,
            auth_user.email,
            user_phone,
            user_phone,
            user_role,
            COALESCE(auth_user.raw_user_meta_data->>'contact_name', 'User'),
            COALESCE(auth_user.raw_user_meta_data->>'business_name', 'Business'),
            COALESCE(auth_user.raw_user_meta_data->>'business_type', 'Retailer'),
            auth_user.created_at,
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            phone_number = COALESCE(profiles.phone_number, EXCLUDED.phone_number),
            normalized_phone = COALESCE(profiles.normalized_phone, EXCLUDED.normalized_phone),
            role = COALESCE(profiles.role, EXCLUDED.role),
            updated_at = NOW();
    END LOOP;
END;
$$;

-- Fix the original auth functions that were missing search_path
CREATE OR REPLACE FUNCTION public.validate_auth_input(input_value text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  cleaned_input text;
  result jsonb;
BEGIN
  cleaned_input := trim(input_value);
  
  -- Check if it's an email
  IF cleaned_input ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    RETURN jsonb_build_object(
      'type', 'email',
      'value', lower(cleaned_input),
      'valid', true
    );
  END IF;
  
  -- Check if it's a phone number (no @ symbol allowed)
  IF NOT cleaned_input LIKE '%@%' THEN
    -- Remove all non-numeric characters for validation
    cleaned_input := regexp_replace(cleaned_input, '[^0-9]', '', 'g');
    
    -- Pakistani phone validation
    IF cleaned_input ~ '^03[0-9]{9}$' OR 
       cleaned_input ~ '^923[0-9]{9}$' OR
       cleaned_input ~ '^3[0-9]{9}$' THEN
      -- Normalize to standard format
      IF cleaned_input ~ '^923[0-9]{9}$' THEN
        cleaned_input := '0' || substring(cleaned_input from 3);
      ELSIF cleaned_input ~ '^3[0-9]{9}$' THEN
        cleaned_input := '0' || cleaned_input;
      END IF;
      
      RETURN jsonb_build_object(
        'type', 'phone',
        'value', cleaned_input,
        'valid', true
      );
    END IF;
  END IF;
  
  -- Invalid input
  RETURN jsonb_build_object(
    'type', 'invalid',
    'value', input_value,
    'valid', false
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.authenticate_user_by_identifier(identifier text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  user_record RECORD;
  input_validation jsonb;
BEGIN
  -- Validate input
  input_validation := public.validate_auth_input(identifier);
  
  IF (input_validation->>'valid')::boolean = false THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid email or phone number format'
    );
  END IF;
  
  -- Find user based on input type
  IF input_validation->>'type' = 'email' THEN
    -- Find by email
    SELECT p.* INTO user_record
    FROM public.profiles p
    WHERE p.email = input_validation->>'value'
    AND p.is_email_user = true
    LIMIT 1;
  ELSE
    -- Find by phone
    SELECT p.* INTO user_record
    FROM public.profiles p
    WHERE p.normalized_phone = input_validation->>'value'
    OR p.phone_number = input_validation->>'value'
    LIMIT 1;
  END IF;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No account found with this email or phone number'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', user_record.id,
    'email', user_record.email,
    'role', user_record.role,
    'auth_type', user_record.auth_type,
    'identifier', COALESCE(user_record.display_identifier, user_record.email)
  );
END;
$function$;