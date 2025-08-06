-- Complete the Pakistani phone authentication system with missing columns

-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS normalized_phone text,
ADD COLUMN IF NOT EXISTS last_otp_request timestamp with time zone;

-- Create index for faster phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_normalized_phone ON public.profiles(normalized_phone);

-- Update existing phone numbers to normalized format (if any exist)
UPDATE public.profiles 
SET normalized_phone = public.normalize_pakistani_phone(phone_number) 
WHERE phone_number IS NOT NULL AND normalized_phone IS NULL;

-- Create Pakistani phone validation function
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

-- Create phone normalization function for consistent storage
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

-- OTP generation function
CREATE OR REPLACE FUNCTION public.generate_otp()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN lpad(floor(random() * 1000000)::text, 6, '0');
END;
$$;

-- Rate limiting function for OTP requests
CREATE OR REPLACE FUNCTION public.can_request_otp(user_phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_requests integer;
BEGIN
  -- Count OTP requests in the last hour
  SELECT COUNT(*)
  INTO recent_requests
  FROM public.profiles
  WHERE normalized_phone = public.normalize_pakistani_phone(user_phone)
    AND last_otp_request > now() - interval '1 hour';
  
  -- Allow max 3 OTP requests per hour
  RETURN recent_requests < 3;
END;
$$;

-- OTP verification function
CREATE OR REPLACE FUNCTION public.verify_otp(user_phone text, provided_otp text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  normalized_phone text;
BEGIN
  normalized_phone := public.normalize_pakistani_phone(user_phone);
  
  -- Get user record
  SELECT * INTO user_record
  FROM public.profiles
  WHERE normalized_phone = normalized_phone;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Check if OTP has expired
  IF user_record.otp_expires_at < now() THEN
    -- Clear expired OTP
    UPDATE public.profiles 
    SET otp_code = NULL, otp_expires_at = NULL, otp_attempts = 0
    WHERE id = user_record.id;
    
    RETURN jsonb_build_object('success', false, 'error', 'OTP has expired');
  END IF;
  
  -- Check attempt limit
  IF user_record.otp_attempts >= 3 THEN
    -- Clear OTP after too many attempts
    UPDATE public.profiles 
    SET otp_code = NULL, otp_expires_at = NULL, otp_attempts = 0
    WHERE id = user_record.id;
    
    RETURN jsonb_build_object('success', false, 'error', 'Too many failed attempts');
  END IF;
  
  -- Increment attempts
  UPDATE public.profiles 
  SET otp_attempts = otp_attempts + 1
  WHERE id = user_record.id;
  
  -- Check if OTP matches
  IF user_record.otp_code = provided_otp THEN
    -- Success - mark phone as verified and clear OTP
    UPDATE public.profiles 
    SET phone_verified = true, 
        otp_code = NULL, 
        otp_expires_at = NULL, 
        otp_attempts = 0
    WHERE id = user_record.id;
    
    -- Log successful verification
    INSERT INTO public.audit_logs (user_id, event_type, table_name, record_id, new_values)
    VALUES (
      user_record.id,
      'phone_verified',
      'profiles',
      user_record.id,
      jsonb_build_object('phone', normalized_phone, 'verified_at', now())
    );
    
    RETURN jsonb_build_object('success', true, 'message', 'Phone verified successfully');
  ELSE
    -- Log failed attempt
    INSERT INTO public.audit_logs (user_id, event_type, table_name, record_id, old_values)
    VALUES (
      user_record.id,
      'otp_failed',
      'profiles',
      user_record.id,
      jsonb_build_object('phone', normalized_phone, 'attempts', user_record.otp_attempts + 1)
    );
    
    RETURN jsonb_build_object('success', false, 'error', 'Invalid OTP');
  END IF;
END;
$$;

-- Account lockout check function
CREATE OR REPLACE FUNCTION public.check_account_lockout(user_phone text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  failed_attempts integer;
  normalized_phone text;
BEGIN
  normalized_phone := public.normalize_pakistani_phone(user_phone);
  
  -- Count failed login attempts in the last hour
  SELECT COUNT(*)
  INTO failed_attempts
  FROM public.audit_logs
  WHERE new_values->>'phone' = normalized_phone
    AND event_type = 'login_failed'
    AND created_at > now() - interval '1 hour';
  
  -- Lockout after 5 failed attempts in 1 hour
  IF failed_attempts >= 5 THEN
    RETURN jsonb_build_object(
      'locked', true, 
      'message', 'Account temporarily locked due to too many failed attempts. Try again later.'
    );
  END IF;
  
  RETURN jsonb_build_object('locked', false);
END;
$$;

-- Trigger to automatically normalize phone numbers on insert/update
CREATE OR REPLACE FUNCTION public.normalize_phone_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.phone_number IS NOT NULL THEN
    NEW.normalized_phone := public.normalize_pakistani_phone(NEW.phone_number);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS normalize_phone_on_insert_update ON public.profiles;
CREATE TRIGGER normalize_phone_on_insert_update
  BEFORE INSERT OR UPDATE OF phone_number ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.normalize_phone_trigger();