
-- Step 1: Add missing columns to profiles table for business information
ALTER TABLE public.profiles 
ADD COLUMN phone_number TEXT,
ADD COLUMN business_name TEXT,
ADD COLUMN contact_name TEXT,
ADD COLUMN business_type TEXT DEFAULT 'wholesaler',
ADD COLUMN ntn_number TEXT,
ADD COLUMN strn_number TEXT,
ADD COLUMN address TEXT,
ADD COLUMN city TEXT,
ADD COLUMN postal_code TEXT,
ADD COLUMN industry TEXT,
ADD COLUMN years_in_business TEXT;

-- Add unique constraints for business registration numbers
CREATE UNIQUE INDEX idx_profiles_phone_number ON public.profiles(phone_number) WHERE phone_number IS NOT NULL;
CREATE UNIQUE INDEX idx_profiles_ntn_number ON public.profiles(ntn_number) WHERE ntn_number IS NOT NULL;
CREATE UNIQUE INDEX idx_profiles_strn_number ON public.profiles(strn_number) WHERE strn_number IS NOT NULL;

-- Update the handle_new_user function to include role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'role', 'pending')
  );
  RETURN NEW;
END;
$$;
