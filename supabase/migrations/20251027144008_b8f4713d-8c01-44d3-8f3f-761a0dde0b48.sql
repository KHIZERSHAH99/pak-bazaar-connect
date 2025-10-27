-- Phase 4: Add unique constraints to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique 
ON public.profiles(lower(email)) WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique 
ON public.profiles(normalized_phone) WHERE normalized_phone IS NOT NULL;

-- Create trigger to prevent duplicate profiles
CREATE OR REPLACE FUNCTION public.prevent_duplicate_profiles()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE (lower(email) = lower(NEW.email) OR normalized_phone = NEW.normalized_phone)
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Account with this email or phone already exists';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER check_duplicate_profiles
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_duplicate_profiles();

-- Phase 5: Clean up existing data - populate normalized_phone
UPDATE public.profiles 
SET 
  normalized_phone = public.normalize_pakistani_phone(phone_number),
  phone_number = public.normalize_pakistani_phone(phone_number)
WHERE phone_number IS NOT NULL 
  AND (normalized_phone IS NULL OR normalized_phone = '');

-- Fix profiles where email contains 'phone-' pattern
UPDATE public.profiles
SET
  phone_number = public.normalize_pakistani_phone(SUBSTRING(email FROM 'phone-(\d+)@')),
  normalized_phone = public.normalize_pakistani_phone(SUBSTRING(email FROM 'phone-(\d+)@'))
WHERE email LIKE 'phone-%@%' 
  AND (phone_number IS NULL OR phone_number = '');

-- Phase 6: Improve OTP verification function
CREATE OR REPLACE FUNCTION public.verify_email_otp(p_user_id uuid, p_otp text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stored_otp text;
  v_expires_at timestamp with time zone;
  v_attempts integer;
BEGIN
  -- Get OTP details
  SELECT verification_otp, otp_expires_at, COALESCE(otp_attempts, 0)
  INTO v_stored_otp, v_expires_at, v_attempts
  FROM public.profiles
  WHERE id = p_user_id;

  -- Check if OTP exists
  IF v_stored_otp IS NULL THEN
    RAISE EXCEPTION 'No verification code found. Please request a new one.';
  END IF;

  -- Check attempts - block after 5 failed attempts
  IF v_attempts >= 5 THEN
    -- Clear OTP to force new request
    UPDATE public.profiles
    SET verification_otp = NULL,
        otp_expires_at = NULL,
        otp_attempts = 0
    WHERE id = p_user_id;
    
    RAISE EXCEPTION 'Too many failed attempts. Please request a new verification code.';
  END IF;

  -- Check expiration
  IF v_expires_at < NOW() THEN
    -- Clear expired OTP
    UPDATE public.profiles
    SET verification_otp = NULL,
        otp_expires_at = NULL,
        otp_attempts = 0
    WHERE id = p_user_id;
    
    RAISE EXCEPTION 'Verification code expired. Please request a new one.';
  END IF;

  -- Verify OTP
  IF v_stored_otp = p_otp THEN
    -- Mark as verified and clear OTP
    UPDATE public.profiles
    SET email_verified = true,
        email_verified_at = NOW(),
        verification_otp = NULL,
        otp_expires_at = NULL,
        otp_attempts = 0
    WHERE id = p_user_id;
    
    RETURN true;
  ELSE
    -- Increment attempts on failure
    UPDATE public.profiles
    SET otp_attempts = otp_attempts + 1
    WHERE id = p_user_id;
    
    RETURN false;
  END IF;
END;
$$;

-- Add rate limiting for OTP generation
CREATE TABLE IF NOT EXISTS public.otp_rate_limits (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  last_sent_at timestamp with time zone DEFAULT now(),
  send_count integer DEFAULT 1,
  PRIMARY KEY (user_id)
);

ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits"
  ON public.otp_rate_limits FOR SELECT
  USING (auth.uid() = user_id);

-- Function to check OTP rate limit
CREATE OR REPLACE FUNCTION public.check_otp_rate_limit(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_sent timestamp with time zone;
  v_count integer;
BEGIN
  -- Get rate limit info
  SELECT last_sent_at, send_count
  INTO v_last_sent, v_count
  FROM public.otp_rate_limits
  WHERE user_id = p_user_id;
  
  -- If no record, allow and create one
  IF NOT FOUND THEN
    INSERT INTO public.otp_rate_limits (user_id, last_sent_at, send_count)
    VALUES (p_user_id, NOW(), 1);
    RETURN true;
  END IF;
  
  -- Reset counter if more than 1 hour passed
  IF v_last_sent < NOW() - INTERVAL '1 hour' THEN
    UPDATE public.otp_rate_limits
    SET last_sent_at = NOW(), send_count = 1
    WHERE user_id = p_user_id;
    RETURN true;
  END IF;
  
  -- Check if exceeded limit (3 per hour)
  IF v_count >= 3 THEN
    RAISE EXCEPTION 'Too many OTP requests. Please try again in % minutes.', 
      EXTRACT(EPOCH FROM (v_last_sent + INTERVAL '1 hour' - NOW()))/60;
  END IF;
  
  -- Increment counter
  UPDATE public.otp_rate_limits
  SET send_count = send_count + 1, last_sent_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$$;