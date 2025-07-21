
-- Phase 1: Critical Database Fixes for Authentication

-- First, let's properly fix the phone_number data extraction and cleanup
UPDATE public.profiles 
SET phone_number = CASE 
  WHEN phone_number IS NULL OR phone_number = '' THEN
    CASE 
      WHEN email ~ '^[0-9]+@(temp-phone-auth\.com|phone\.auth\.local)$' THEN
        REGEXP_REPLACE(email, '@(temp-phone-auth\.com|phone\.auth\.local)$', '')
      ELSE '03000000000'  -- Default fallback for users without phone numbers
    END
  ELSE phone_number
END
WHERE phone_number IS NULL OR phone_number = '';

-- Create the missing demo accounts that are referenced in the login UI
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  aud,
  role
) VALUES 
(
  'demo-wholesaler-uuid-1234',
  '03001234567@phone.auth.local',
  crypt('demo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"role": "wholesaler", "phone_number": "03001234567", "contact_name": "Demo Wholesaler", "business_name": "Demo Wholesale Business"}',
  'authenticated',
  'authenticated'
),
(
  'demo-seller-uuid-5678',
  '03004567890@phone.auth.local', 
  crypt('demo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"role": "seller", "phone_number": "03004567890", "contact_name": "Demo Seller", "business_name": "Demo Retail Business"}',
  'authenticated',
  'authenticated'
)
ON CONFLICT (email) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- Create corresponding profiles for demo accounts
INSERT INTO public.profiles (
  id, 
  email, 
  phone_number,
  contact_name,
  business_name,
  role
) VALUES 
(
  'demo-wholesaler-uuid-1234',
  '03001234567@phone.auth.local',
  '03001234567',
  'Demo Wholesaler',
  'Demo Wholesale Business',
  'wholesaler'
),
(
  'demo-seller-uuid-5678',
  '03004567890@phone.auth.local',
  '03004567890',
  'Demo Seller', 
  'Demo Retail Business',
  'seller'
)
ON CONFLICT (id) DO UPDATE SET
  phone_number = EXCLUDED.phone_number,
  contact_name = EXCLUDED.contact_name,
  business_name = EXCLUDED.business_name,
  role = EXCLUDED.role;

-- Fix the existing user that's having login issues (from the screenshot)
UPDATE public.profiles 
SET phone_number = '03418337167',
    contact_name = COALESCE(contact_name, 'User'),
    business_name = COALESCE(business_name, 'Business')
WHERE email = '03418337167@temp-phone-auth.com' 
  AND (phone_number IS NULL OR phone_number = '');

-- Ensure all profiles have required fields populated
UPDATE public.profiles 
SET 
  contact_name = COALESCE(contact_name, 'User'),
  business_name = COALESCE(business_name, 'Business'),
  phone_number = COALESCE(phone_number, '03000000000')
WHERE contact_name IS NULL OR business_name IS NULL OR phone_number IS NULL;

-- Create index for better phone number lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON public.profiles(phone_number);

-- Add a function to validate phone numbers during login
CREATE OR REPLACE FUNCTION public.find_user_by_phone(phone_input text)
RETURNS TABLE(user_id uuid, user_email text, user_phone text, user_role text) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  clean_phone text;
BEGIN
  -- Clean the phone number input
  clean_phone := regexp_replace(phone_input, '[^0-9]', '', 'g');
  
  -- Return user data if found
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.phone_number,
    p.role
  FROM public.profiles p
  WHERE p.phone_number = clean_phone
  LIMIT 1;
END;
$$;
