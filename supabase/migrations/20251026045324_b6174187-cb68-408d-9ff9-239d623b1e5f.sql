-- Phase 1: Authentication Database Enhancements

-- Add email verification columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS verification_otp text,
ADD COLUMN IF NOT EXISTS otp_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS otp_attempts integer DEFAULT 0;

-- Create unique constraints on email and normalized_phone
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique 
ON public.profiles (LOWER(email)) 
WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique 
ON public.profiles (normalized_phone) 
WHERE normalized_phone IS NOT NULL;

-- Create function to generate OTP
CREATE OR REPLACE FUNCTION generate_otp()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$;

-- Create function to verify OTP
CREATE OR REPLACE FUNCTION verify_email_otp(
  p_user_id uuid,
  p_otp text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stored_otp text;
  v_expires_at timestamp with time zone;
  v_attempts integer;
BEGIN
  -- Get OTP details
  SELECT verification_otp, otp_expires_at, otp_attempts
  INTO v_stored_otp, v_expires_at, v_attempts
  FROM profiles
  WHERE id = p_user_id;

  -- Check if OTP exists
  IF v_stored_otp IS NULL THEN
    RETURN false;
  END IF;

  -- Check attempts
  IF v_attempts >= 5 THEN
    RAISE EXCEPTION 'Too many failed attempts. Please request a new code.';
  END IF;

  -- Check expiration
  IF v_expires_at < NOW() THEN
    RETURN false;
  END IF;

  -- Verify OTP
  IF v_stored_otp = p_otp THEN
    -- Mark as verified
    UPDATE profiles
    SET email_verified = true,
        email_verified_at = NOW(),
        verification_otp = NULL,
        otp_expires_at = NULL,
        otp_attempts = 0
    WHERE id = p_user_id;
    
    RETURN true;
  ELSE
    -- Increment attempts
    UPDATE profiles
    SET otp_attempts = otp_attempts + 1
    WHERE id = p_user_id;
    
    RETURN false;
  END IF;
END;
$$;

-- Add index for better performance on verification queries
CREATE INDEX IF NOT EXISTS idx_profiles_verification_otp 
ON profiles(verification_otp) 
WHERE verification_otp IS NOT NULL;

-- Comment on new columns
COMMENT ON COLUMN profiles.email_verified IS 'Whether the user email has been verified';
COMMENT ON COLUMN profiles.email_verified_at IS 'Timestamp when email was verified';
COMMENT ON COLUMN profiles.verification_otp IS 'Current OTP code for email verification';
COMMENT ON COLUMN profiles.otp_expires_at IS 'Expiration time for the OTP code';
COMMENT ON COLUMN profiles.otp_attempts IS 'Number of failed OTP verification attempts';