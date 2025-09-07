-- Fix existing phone-based account without phone data
UPDATE profiles 
SET 
  phone_number = '03149388513',
  normalized_phone = '03149388513',
  auth_type = 'phone',
  display_identifier = '03149388513',
  email = 'phone-03149388513@pakbazaarconnect.store'
WHERE email = 'phone-03149388513@pakbazaarconnect.store' 
  AND (phone_number IS NULL OR normalized_phone IS NULL);

-- Update auth.users metadata to include phone data
UPDATE auth.users
SET 
  raw_user_meta_data = jsonb_set(
    jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{phone_number}',
      '"03149388513"'::jsonb
    ),
    '{normalized_phone}',
    '"03149388513"'::jsonb
  ),
  email_confirmed_at = CASE 
    WHEN email_confirmed_at IS NULL THEN NOW() 
    ELSE email_confirmed_at 
  END
WHERE email = 'phone-03149388513@pakbazaarconnect.store';

-- Create trigger to auto-confirm phone-based accounts
CREATE OR REPLACE FUNCTION auto_confirm_phone_accounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm accounts with phone-based emails
  IF NEW.email LIKE 'phone-%@pakbazaarconnect.store' THEN
    NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, NOW());
    NEW.confirmed_at = COALESCE(NEW.confirmed_at, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_confirm_phone_accounts_trigger ON auth.users;

-- Create trigger for new accounts
CREATE TRIGGER auto_confirm_phone_accounts_trigger
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_phone_accounts();

-- Create enhanced profile sync trigger
CREATE OR REPLACE FUNCTION sync_phone_to_profile()
RETURNS TRIGGER AS $$
DECLARE
  phone_num text;
  normalized text;
BEGIN
  -- Extract phone number from phone-based email
  IF NEW.email LIKE 'phone-%@pakbazaarconnect.store' THEN
    phone_num := substring(NEW.email from 7 for position('@' in NEW.email) - 7);
    normalized := phone_num;
    
    -- Update or insert profile with phone data
    INSERT INTO profiles (
      id, 
      email, 
      phone_number, 
      normalized_phone,
      role,
      contact_name,
      business_name,
      business_type,
      address,
      city,
      postal_code,
      industry,
      auth_type,
      display_identifier
    ) VALUES (
      NEW.id,
      NEW.email,
      phone_num,
      normalized,
      COALESCE(NEW.raw_user_meta_data->>'role', 'seller'),
      COALESCE(NEW.raw_user_meta_data->>'contact_name', 'User'),
      COALESCE(NEW.raw_user_meta_data->>'business_name', 'Business'),
      COALESCE(NEW.raw_user_meta_data->>'business_type', 'seller'),
      COALESCE(NEW.raw_user_meta_data->>'address', ''),
      COALESCE(NEW.raw_user_meta_data->>'city', ''),
      COALESCE(NEW.raw_user_meta_data->>'postal_code', ''),
      COALESCE(NEW.raw_user_meta_data->>'industry', ''),
      'phone',
      phone_num
    )
    ON CONFLICT (id) DO UPDATE SET
      phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
      normalized_phone = COALESCE(EXCLUDED.normalized_phone, profiles.normalized_phone),
      auth_type = 'phone',
      display_identifier = COALESCE(EXCLUDED.display_identifier, profiles.display_identifier);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_phone_to_profile_trigger ON auth.users;

-- Create trigger for syncing phone data
CREATE TRIGGER sync_phone_to_profile_trigger
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_phone_to_profile();