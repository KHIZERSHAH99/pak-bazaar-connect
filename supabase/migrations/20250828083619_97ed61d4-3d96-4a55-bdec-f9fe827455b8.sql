-- Standardize email formats for phone-based authentication
-- Update existing phone-based accounts to use consistent @phone.auth suffix

-- First, let's check and update profiles with phone numbers
UPDATE auth.users
SET email = CONCAT(normalized_phone, '@phone.auth')
FROM public.profiles p
WHERE auth.users.id = p.id
  AND p.normalized_phone IS NOT NULL
  AND auth.users.email LIKE '%@temp-phone-auth.com';

-- Update any remaining temp-phone-auth.com emails
UPDATE auth.users
SET email = REPLACE(email, '@temp-phone-auth.com', '@phone.auth')
WHERE email LIKE '%@temp-phone-auth.com';

-- Create test accounts with correct format if they don't exist
DO $$
DECLARE
  test_phones TEXT[] := ARRAY['03001234567', '03121234567', '03331234567'];
  phone TEXT;
  user_id UUID;
BEGIN
  FOREACH phone IN ARRAY test_phones
  LOOP
    -- Check if user already exists
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = phone || '@phone.auth';
    
    IF user_id IS NULL THEN
      -- Create new test user (Note: password will be 'test123')
      -- This is a simplified version - in production, use proper password hashing
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        phone || '@phone.auth',
        crypt('test123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object(
          'phone', phone,
          'role', CASE 
            WHEN phone = '03001234567' THEN 'admin'
            WHEN phone = '03121234567' THEN 'wholesaler'
            ELSE 'seller'
          END
        ),
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
      ) RETURNING id INTO user_id;
      
      -- Create corresponding profile
      INSERT INTO public.profiles (
        id,
        email,
        phone_number,
        normalized_phone,
        role,
        business_name,
        contact_name,
        phone_verified
      ) VALUES (
        user_id,
        phone || '@phone.auth',
        phone,
        phone,
        CASE 
          WHEN phone = '03001234567' THEN 'admin'
          WHEN phone = '03121234567' THEN 'wholesaler'
          ELSE 'seller'
        END,
        'Test Business ' || phone,
        'Test User',
        true
      ) ON CONFLICT (id) DO UPDATE
      SET 
        email = EXCLUDED.email,
        phone_number = EXCLUDED.phone_number,
        normalized_phone = EXCLUDED.normalized_phone,
        phone_verified = true;
    END IF;
  END LOOP;
END $$;