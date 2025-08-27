-- Create proper test accounts with phone authentication
-- Use ON CONFLICT to handle existing records

DO $$
DECLARE
  test_user_id1 UUID;
  test_user_id2 UUID;
  test_user_id3 UUID;
BEGIN
  -- Test Account 1: Wholesaler with phone 03001234567
  test_user_id1 := gen_random_uuid();
  
  -- Create auth user if doesn't exist
  INSERT INTO auth.users (
    id, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    raw_app_meta_data, 
    raw_user_meta_data, 
    created_at, 
    updated_at
  )
  VALUES (
    test_user_id1,
    '03001234567@phone.auth',
    crypt('test123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "wholesaler", "phone": "03001234567"}',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE 
  SET encrypted_password = EXCLUDED.encrypted_password;
  
  -- Get the actual user id (in case of conflict)
  SELECT id INTO test_user_id1 FROM auth.users WHERE email = '03001234567@phone.auth';
  
  -- Create/update profile
  INSERT INTO public.profiles (
    id,
    email,
    phone_number,
    normalized_phone,
    role,
    business_name,
    contact_name,
    verification_status
  )
  VALUES (
    test_user_id1,
    '03001234567@phone.auth',
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
    email = EXCLUDED.email;

  -- Test Account 2: Seller with phone 03121234567  
  test_user_id2 := gen_random_uuid();
  
  INSERT INTO auth.users (
    id, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    raw_app_meta_data, 
    raw_user_meta_data, 
    created_at, 
    updated_at
  )
  VALUES (
    test_user_id2,
    '03121234567@phone.auth',
    crypt('test123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "seller", "phone": "03121234567"}',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE 
  SET encrypted_password = EXCLUDED.encrypted_password;
  
  -- Get the actual user id
  SELECT id INTO test_user_id2 FROM auth.users WHERE email = '03121234567@phone.auth';
  
  -- Create/update profile
  INSERT INTO public.profiles (
    id,
    email,
    phone_number,
    normalized_phone,
    role,
    business_name,
    contact_name,
    verification_status
  )
  VALUES (
    test_user_id2,
    '03121234567@phone.auth',
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
    email = EXCLUDED.email;

  -- Test Account 3: Another wholesaler with phone 03331234567
  test_user_id3 := gen_random_uuid();
  
  INSERT INTO auth.users (
    id, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    raw_app_meta_data, 
    raw_user_meta_data, 
    created_at, 
    updated_at
  )
  VALUES (
    test_user_id3,
    '03331234567@phone.auth',
    crypt('test123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "wholesaler", "phone": "03331234567"}',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE 
  SET encrypted_password = EXCLUDED.encrypted_password;
  
  -- Get the actual user id
  SELECT id INTO test_user_id3 FROM auth.users WHERE email = '03331234567@phone.auth';
  
  -- Create/update profile
  INSERT INTO public.profiles (
    id,
    email,
    phone_number,
    normalized_phone,
    role,
    business_name,
    contact_name,
    verification_status
  )
  VALUES (
    test_user_id3,
    '03331234567@phone.auth',
    '03331234567',
    '03331234567',
    'wholesaler',
    'Test Wholesale Company 2',
    'Test Wholesaler 2',
    'approved'
  )
  ON CONFLICT (id) DO UPDATE SET
    phone_number = EXCLUDED.phone_number,
    normalized_phone = EXCLUDED.normalized_phone,
    email = EXCLUDED.email;

END $$;