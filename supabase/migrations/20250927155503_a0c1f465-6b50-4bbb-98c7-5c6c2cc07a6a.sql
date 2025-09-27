-- Fix ambiguous/incorrect normalized_phone comparisons and improve reliability
-- 1) Repair public.send_otp_sms to correctly match by normalized phone
CREATE OR REPLACE FUNCTION public.send_otp_sms(p_phone_number text, p_otp_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_normalized_phone TEXT;
  user_rec RECORD;
  sms_log_id UUID;
BEGIN
  -- Normalize phone number
  v_normalized_phone := public.normalize_pakistani_phone(p_phone_number);

  -- Validate phone number
  IF NOT public.validate_pakistani_phone(v_normalized_phone) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid Pakistani phone number');
  END IF;

  -- Check rate limiting
  IF NOT public.can_request_otp(v_normalized_phone) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Too many OTP requests. Please wait before trying again.');
  END IF;

  -- Get user profile by normalized phone (correctly qualified)
  SELECT p.* INTO user_rec
  FROM public.profiles p
  WHERE p.normalized_phone = v_normalized_phone
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Phone number not registered');
  END IF;

  -- Update OTP on profile
  UPDATE public.profiles
  SET 
    otp_code = p_otp_code,
    otp_expires_at = NOW() + INTERVAL '10 minutes',
    otp_attempts = 0,
    last_otp_request = NOW()
  WHERE id = user_rec.id;

  -- Log SMS attempt
  INSERT INTO public.sms_logs (
    phone_number,
    message_type,
    message_content,
    status,
    metadata
  ) VALUES (
    v_normalized_phone,
    'otp',
    'OTP sent',
    'pending',
    jsonb_build_object('user_id', user_rec.id, 'otp_length', length(p_otp_code))
  ) RETURNING id INTO sms_log_id;

  -- Return success (note: includes otp_code as in original behavior)
  RETURN jsonb_build_object(
    'success', true, 
    'sms_log_id', sms_log_id,
    'phone', v_normalized_phone,
    'otp_code', p_otp_code
  );
END;
$function$;

-- 2) Harden public.check_phone_exists to avoid any ambiguity and qualify columns
CREATE OR REPLACE FUNCTION public.check_phone_exists(p_phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  phone_exists boolean;
  v_normalized_phone text;
BEGIN
  -- Normalize the phone number
  v_normalized_phone := normalize_pakistani_phone(p_phone);

  -- Check if phone exists (fully qualified column references)
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p
    WHERE p.phone_number = p_phone
       OR p.phone_number = v_normalized_phone
       OR p.normalized_phone = v_normalized_phone
  ) INTO phone_exists;
  
  RETURN phone_exists;
END;
$function$;