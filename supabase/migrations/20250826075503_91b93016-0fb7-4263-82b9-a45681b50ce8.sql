-- First ensure the get_user_role function exists
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT COALESCE(role, 'pending') FROM public.profiles WHERE id = auth.uid();
$function$;

-- Now create test accounts for authentication testing
DO $$
DECLARE
  test_user_id1 UUID;
  test_user_id2 UUID;
BEGIN
  -- Test Wholesaler Account with phone authentication
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = '03001234567@phone-auth.com') THEN
    test_user_id1 := gen_random_uuid();
    
    -- Create auth user
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      test_user_id1,
      '03001234567@phone-auth.com',
      crypt('test123', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"role": "wholesaler", "phone": "03001234567"}',
      NOW(),
      NOW()
    );
    
    -- Create profile
    INSERT INTO public.profiles (id, email, phone_number, normalized_phone, role, business_name, contact_name, verification_status)
    VALUES (
      test_user_id1,
      '03001234567@phone-auth.com',
      '03001234567',
      '03001234567',
      'wholesaler',
      'Test Wholesale Business',
      'Test Wholesaler',
      'approved'
    );
  END IF;

  -- Test Seller Account with phone authentication
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = '03121234567@phone-auth.com') THEN
    test_user_id2 := gen_random_uuid();
    
    -- Create auth user
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      test_user_id2,
      '03121234567@phone-auth.com',
      crypt('test123', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"role": "seller", "phone": "03121234567"}',
      NOW(),
      NOW()
    );
    
    -- Create profile
    INSERT INTO public.profiles (id, email, phone_number, normalized_phone, role, business_name, contact_name, verification_status)
    VALUES (
      test_user_id2,
      '03121234567@phone-auth.com',
      '03121234567',
      '03121234567',
      'seller',
      'Test Retail Store',
      'Test Seller',
      'approved'
    );
  END IF;

END $$;

-- Update existing phone-based accounts to have known test passwords
UPDATE auth.users
SET encrypted_password = crypt('test123', gen_salt('bf'))
WHERE email IN ('03418837167@temp-phone-auth.com', '03418337167@temp-phone-auth.com');