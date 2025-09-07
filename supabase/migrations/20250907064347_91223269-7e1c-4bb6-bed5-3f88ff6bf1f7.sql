-- First create the validate_pakistani_phone function that's being referenced
CREATE OR REPLACE FUNCTION public.validate_pakistani_phone(phone_input text)
RETURNS boolean AS $$
DECLARE
  clean_phone text;
BEGIN
  IF phone_input IS NULL THEN
    RETURN true; -- Allow NULL values
  END IF;
  
  -- Remove all non-numeric characters
  clean_phone := regexp_replace(phone_input, '[^0-9]', '', 'g');
  
  -- Check if it's a valid Pakistani mobile number
  -- Valid formats: 03XX-XXXXXXX (11 digits starting with 03)
  RETURN clean_phone ~ '^03[0-9]{9}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Now fix the existing phone-based account
UPDATE profiles 
SET 
  phone_number = '03149388513',
  normalized_phone = '03149388513',
  auth_type = 'phone',
  display_identifier = '03149388513'
WHERE email = 'phone-03149388513@pakbazaarconnect.store';