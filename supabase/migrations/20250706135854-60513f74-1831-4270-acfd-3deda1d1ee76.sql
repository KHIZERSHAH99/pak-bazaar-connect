
-- Remove NTN and STRN columns from profiles table and update authentication to use phone numbers
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS ntn_number,
DROP COLUMN IF EXISTS strn_number;

-- Make phone_number required and unique for authentication
ALTER TABLE public.profiles 
ALTER COLUMN phone_number SET NOT NULL;

-- Add unique constraint for phone numbers (drop existing if it exists)
DROP INDEX IF EXISTS idx_profiles_phone_number;
CREATE UNIQUE INDEX idx_profiles_phone_number ON public.profiles(phone_number);

-- Update handle_new_user function to use phone from metadata
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

-- Create a profile for the existing user if missing
INSERT INTO public.profiles (
  id, 
  email, 
  phone_number,
  contact_name,
  business_name,
  role
) VALUES (
  '479f704a-fd94-430f-b072-2cee6bc2c47f',
  'wholeeseler@gmail.com',
  '03418837167',
  'Irum Naz',
  'mk1231',
  'seller'
) ON CONFLICT (id) DO UPDATE SET
  phone_number = EXCLUDED.phone_number,
  contact_name = EXCLUDED.contact_name,
  business_name = EXCLUDED.business_name,
  role = EXCLUDED.role;
