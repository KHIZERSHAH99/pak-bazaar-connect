-- Drop the problematic function and its triggers first
DROP FUNCTION IF EXISTS validate_profile_update CASCADE;

-- Now create the validate_pakistani_phone function
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

-- Recreate the validate_profile_update function
CREATE OR REPLACE FUNCTION validate_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent users from changing their own role (except through proper role request process)
  IF OLD.role IS DISTINCT FROM NEW.role AND auth.uid() = NEW.id THEN
    -- Only allow role changes through the proper role request process or by admins
    IF get_user_role() != 'admin' THEN
      RAISE EXCEPTION 'Direct role changes are not allowed. Please use the role request process.';
    END IF;
  END IF;
  
  -- Validate email format if being changed
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Invalid email format';
    END IF;
  END IF;
  
  -- Validate phone number format if being changed
  IF OLD.phone_number IS DISTINCT FROM NEW.phone_number AND NEW.phone_number IS NOT NULL THEN
    IF NOT validate_pakistani_phone(NEW.phone_number) THEN
      RAISE EXCEPTION 'Invalid Pakistani phone number format';
    END IF;
  END IF;
  
  -- Log sensitive data changes for audit trail
  IF OLD.email IS DISTINCT FROM NEW.email 
     OR OLD.phone_number IS DISTINCT FROM NEW.phone_number 
     OR OLD.cnic_image IS DISTINCT FROM NEW.cnic_image 
     OR OLD.selfie_image IS DISTINCT FROM NEW.selfie_image THEN
    
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      table_name,
      record_id,
      old_values,
      new_values
    ) VALUES (
      auth.uid(),
      'sensitive_profile_data_changed',
      'profiles',
      NEW.id,
      jsonb_build_object(
        'email', CASE WHEN OLD.email IS DISTINCT FROM NEW.email THEN OLD.email ELSE NULL END,
        'phone', CASE WHEN OLD.phone_number IS DISTINCT FROM NEW.phone_number THEN OLD.phone_number ELSE NULL END
      ),
      jsonb_build_object(
        'email', CASE WHEN OLD.email IS DISTINCT FROM NEW.email THEN NEW.email ELSE NULL END,
        'phone', CASE WHEN OLD.phone_number IS DISTINCT FROM NEW.phone_number THEN NEW.phone_number ELSE NULL END,
        'changed_by', auth.uid()
      )
    );
  END IF;
  
  -- Log admin access to other users' profiles
  IF get_user_role() = 'admin' AND auth.uid() != NEW.id THEN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      table_name,
      record_id,
      new_values
    ) VALUES (
      auth.uid(),
      'admin_profile_access',
      'profiles',
      NEW.id,
      jsonb_build_object(
        'accessed_user_id', NEW.id,
        'admin_id', auth.uid(),
        'access_time', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-enable the trigger
CREATE TRIGGER validate_profile_update_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_profile_update();

-- Now fix the existing phone-based account
UPDATE profiles 
SET 
  phone_number = '03149388513',
  normalized_phone = '03149388513',
  auth_type = 'phone',
  display_identifier = '03149388513'
WHERE email = 'phone-03149388513@pakbazaarconnect.store';

-- Update auth.users metadata and confirm the account
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
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
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