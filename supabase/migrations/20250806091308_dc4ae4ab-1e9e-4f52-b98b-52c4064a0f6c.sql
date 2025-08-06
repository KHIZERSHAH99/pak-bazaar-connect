-- Create Pakistani phone authentication system with functions in correct order

-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS normalized_phone text,
ADD COLUMN IF NOT EXISTS last_otp_request timestamp with time zone;

-- Create phone normalization function first
CREATE OR REPLACE FUNCTION public.normalize_pakistani_phone(phone_input text)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  clean_phone text;
BEGIN
  IF phone_input IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove all non-numeric characters
  clean_phone := regexp_replace(phone_input, '[^0-9]', '', 'g');
  
  -- Convert different formats to standard 03XX-XXXXXXX format
  IF clean_phone ~ '^923[0-9]{9}$' THEN
    -- From +92 3XX XXXXXXX to 03XX XXXXXXX
    RETURN '0' || substring(clean_phone from 3);
  ELSIF clean_phone ~ '^3[0-9]{9}$' THEN
    -- From 3XX XXXXXXX to 03XX XXXXXXX
    RETURN '0' || clean_phone;
  ELSIF clean_phone ~ '^03[0-9]{9}$' THEN
    -- Already in correct format
    RETURN clean_phone;
  ELSE
    -- Invalid format, return as-is
    RETURN clean_phone;
  END IF;
END;
$$;

-- Now update existing phone numbers to normalized format
UPDATE public.profiles 
SET normalized_phone = public.normalize_pakistani_phone(phone_number) 
WHERE phone_number IS NOT NULL AND normalized_phone IS NULL;

-- Create index for faster phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_normalized_phone ON public.profiles(normalized_phone);

-- Pakistani phone validation function
CREATE OR REPLACE FUNCTION public.validate_pakistani_phone(phone_input text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  clean_phone text;
BEGIN
  -- Remove all non-numeric characters
  clean_phone := regexp_replace(phone_input, '[^0-9]', '', 'g');
  
  -- Check if it's a valid Pakistani mobile number
  -- Valid formats: 03XX-XXXXXXX (11 digits starting with 03)
  -- Network codes: 300-399 (Jazz, Telenor, Ufone, Zong)
  RETURN clean_phone ~ '^03[0-9]{9}$';
END;
$$;

-- Rest of the functions remain the same
CREATE OR REPLACE FUNCTION public.generate_otp()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN lpad(floor(random() * 1000000)::text, 6, '0');
END;
$$;