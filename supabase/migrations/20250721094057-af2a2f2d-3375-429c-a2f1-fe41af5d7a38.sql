
-- Phase 1: Fix Database Structure and Data

-- First, let's create the proper handle_new_user trigger that was missing
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    phone_number,
    contact_name,
    business_name,
    address,
    city,
    postal_code,
    role
  )
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'contact_name',
    NEW.raw_user_meta_data->>'business_name',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'postal_code',
    COALESCE(NEW.raw_user_meta_data->>'role', 'pending')
  );
  RETURN NEW;
END;
$$;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix existing profile data by extracting phone numbers from email addresses where needed
UPDATE public.profiles 
SET phone_number = CASE 
  WHEN phone_number IS NULL OR phone_number = '' THEN
    CASE 
      WHEN email ~ '^[0-9]+@(temp-phone-auth\.com|phone\.auth\.local)$' THEN
        REGEXP_REPLACE(email, '@(temp-phone-auth\.com|phone\.auth\.local)$', '')
      ELSE phone_number
    END
  ELSE phone_number
END
WHERE phone_number IS NULL OR phone_number = '' OR email ~ '^[0-9]+@(temp-phone-auth\.com|phone\.auth\.local)$';

-- Ensure phone_number is not null for users with phone-based emails
UPDATE public.profiles 
SET phone_number = COALESCE(phone_number, '03000000000')
WHERE phone_number IS NULL;

-- Add constraint to ensure phone_number is not null going forward
ALTER TABLE public.profiles 
ALTER COLUMN phone_number SET NOT NULL;

-- Add index for better phone number lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_lookup ON public.profiles(phone_number) WHERE phone_number IS NOT NULL;

-- Create demo users if they don't exist
DO $$
BEGIN
  -- Insert demo wholesaler profile if it doesn't exist
  INSERT INTO public.profiles (
    id, 
    email, 
    phone_number,
    contact_name,
    business_name,
    role
  ) VALUES (
    'demo-wholesaler-uuid',
    '03001234567@phone.auth.local',
    '03001234567',
    'Demo Wholesaler',
    'Demo Wholesale Business',
    'wholesaler'
  ) ON CONFLICT (id) DO UPDATE SET
    phone_number = EXCLUDED.phone_number,
    contact_name = EXCLUDED.contact_name,
    business_name = EXCLUDED.business_name,
    role = EXCLUDED.role;

  -- Insert demo seller profile if it doesn't exist
  INSERT INTO public.profiles (
    id, 
    email, 
    phone_number,
    contact_name,
    business_name,
    role
  ) VALUES (
    'demo-seller-uuid',
    '03004567890@phone.auth.local',
    '03004567890',
    'Demo Seller',
    'Demo Retail Business',
    'seller'
  ) ON CONFLICT (id) DO UPDATE SET
    phone_number = EXCLUDED.phone_number,
    contact_name = EXCLUDED.contact_name,
    business_name = EXCLUDED.business_name,
    role = EXCLUDED.role;
END $$;
