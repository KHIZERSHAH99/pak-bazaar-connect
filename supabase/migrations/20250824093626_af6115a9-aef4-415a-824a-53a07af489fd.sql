-- Fix function search path issues by updating remaining functions
-- These functions need proper search path configuration

CREATE OR REPLACE FUNCTION public.can_request_otp(user_phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.generate_otp()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN lpad(floor(random() * 1000000)::text, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_phone_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.phone_number IS NOT NULL THEN
    NEW.normalized_phone := public.normalize_pakistani_phone(NEW.phone_number);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_pakistani_phone(phone_input text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.validate_pakistani_phone(phone_input text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
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