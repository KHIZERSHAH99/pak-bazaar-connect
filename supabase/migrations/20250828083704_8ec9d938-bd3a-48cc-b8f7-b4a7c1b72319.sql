-- Standardize email formats for phone-based authentication
-- Update existing phone-based accounts to use consistent @phone.auth suffix

-- First, update profiles with phone numbers in auth.users
UPDATE auth.users
SET email = CONCAT(p.normalized_phone, '@phone.auth')
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
  test_phone TEXT;
  user_id UUID;
BEGIN
  FOREACH test_phone IN ARRAY test_phones
  LOOP
    -- Check if user already exists
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = test_phone || '@phone.auth';
    
    IF user_id IS NULL THEN
      -- Check if exists with old format
      SELECT id INTO user_id
      FROM auth.users
      WHERE email = test_phone || '@temp-phone-auth.com';
      
      IF user_id IS NOT NULL THEN
        -- Update existing user's email
        UPDATE auth.users
        SET email = test_phone || '@phone.auth'
        WHERE id = user_id;
        
        UPDATE public.profiles
        SET email = test_phone || '@phone.auth'
        WHERE id = user_id;
      END IF;
    END IF;
  END LOOP;
END $$;