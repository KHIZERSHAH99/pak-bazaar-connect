-- Create test accounts for authentication testing
-- These accounts will have simple passwords for testing purposes

-- First, create auth users with test passwords
DO $$
DECLARE
  test_user_id1 UUID;
  test_user_id2 UUID;
  test_user_id3 UUID;
BEGIN
  -- Check if test accounts already exist, if not create them
  
  -- Test Wholesaler Account
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test-wholesaler@test.com') THEN
    test_user_id1 := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (
      test_user_id1,
      'test-wholesaler@test.com',
      crypt('test123', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"role": "wholesaler", "phone": "03001234567"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
    
    -- Create profile for test wholesaler
    INSERT INTO public.profiles (id, email, phone_number, normalized_phone, role, business_name, contact_name, verification_status)
    VALUES (
      test_user_id1,
      'test-wholesaler@test.com',
      '03001234567',
      '03001234567',
      'wholesaler',
      'Test Wholesale Business',
      'Test Wholesaler',
      'approved'
    )
    ON CONFLICT (id) DO UPDATE SET
      phone_number = EXCLUDED.phone_number,
      normalized_phone = EXCLUDED.normalized_phone,
      role = EXCLUDED.role;
  END IF;

  -- Test Seller Account
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test-seller@test.com') THEN
    test_user_id2 := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (
      test_user_id2,
      'test-seller@test.com',
      crypt('test123', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"role": "seller", "phone": "03121234567"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
    
    -- Create profile for test seller
    INSERT INTO public.profiles (id, email, phone_number, normalized_phone, role, business_name, contact_name, verification_status)
    VALUES (
      test_user_id2,
      'test-seller@test.com',
      '03121234567',
      '03121234567',
      'seller',
      'Test Retail Store',
      'Test Seller',
      'approved'
    )
    ON CONFLICT (id) DO UPDATE SET
      phone_number = EXCLUDED.phone_number,
      normalized_phone = EXCLUDED.normalized_phone,
      role = EXCLUDED.role;
  END IF;

  -- Test Admin Account (only if khizerfight@gmail.com doesn't exist)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test-admin@test.com') THEN
    test_user_id3 := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (
      test_user_id3,
      'test-admin@test.com',
      crypt('admin123', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"role": "admin", "phone": "03331234567"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
    
    -- Create profile for test admin (but not with admin role due to trigger)
    INSERT INTO public.profiles (id, email, phone_number, normalized_phone, role, business_name, contact_name, verification_status)
    VALUES (
      test_user_id3,
      'test-admin@test.com',
      '03331234567',
      '03331234567',
      'seller', -- Will be seller since only khizerfight@gmail.com can be admin
      'Test Admin Account',
      'Test Admin',
      'approved'
    )
    ON CONFLICT (id) DO UPDATE SET
      phone_number = EXCLUDED.phone_number,
      normalized_phone = EXCLUDED.normalized_phone;
  END IF;

END $$;

-- Update existing phone-based accounts to have usable passwords
UPDATE auth.users
SET encrypted_password = crypt('test123', gen_salt('bf'))
WHERE email IN ('03418837167@temp-phone-auth.com', '03418337167@temp-phone-auth.com');