
-- Fix: Remove OTP code from send_otp_sms return value to prevent exposure
CREATE OR REPLACE FUNCTION public.send_otp_sms(
  p_phone_number text,
  p_otp_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  normalized_phone text;
  sms_log_id uuid;
  rate_limit_ok boolean;
BEGIN
  -- Normalize phone number
  normalized_phone := regexp_replace(p_phone_number, '[^0-9+]', '', 'g');
  
  IF normalized_phone IS NULL OR length(normalized_phone) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid phone number');
  END IF;

  -- Check rate limiting
  SELECT public.secure_check_rate_limit(
    normalized_phone,
    'otp_sms',
    5,
    60
  ) INTO rate_limit_ok;

  IF rate_limit_ok = false THEN
    RETURN jsonb_build_object('success', false, 'error', 'Too many OTP requests. Please wait.');
  END IF;

  -- Log the SMS attempt (without OTP code)
  INSERT INTO public.sms_logs (phone_number, message_type, status)
  VALUES (normalized_phone, 'otp', 'sent')
  RETURNING id INTO sms_log_id;

  -- Return success WITHOUT the OTP code
  RETURN jsonb_build_object(
    'success', true,
    'sms_log_id', sms_log_id,
    'phone', normalized_phone
  );
END;
$$;
