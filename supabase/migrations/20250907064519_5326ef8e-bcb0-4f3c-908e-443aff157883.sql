-- Update auth.users metadata and confirm the account (without touching confirmed_at which is generated)
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
  email_confirmed_at = NOW()
WHERE email = 'phone-03149388513@pakbazaarconnect.store';

-- Create trigger to auto-confirm phone-based accounts
CREATE OR REPLACE FUNCTION auto_confirm_phone_accounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm accounts with phone-based emails
  IF NEW.email LIKE 'phone-%@pakbazaarconnect.store' THEN
    NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, NOW());
    -- Don't touch confirmed_at as it's a generated column
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