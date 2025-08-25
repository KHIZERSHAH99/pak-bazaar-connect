-- Create SMS logs table for tracking SMS sending
CREATE TABLE IF NOT EXISTS public.sms_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  message_type TEXT NOT NULL, -- 'otp', 'notification', etc.
  message_content TEXT,
  provider TEXT DEFAULT 'twilio',
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  provider_message_id TEXT,
  error_message TEXT,
  cost DECIMAL(10, 4),
  retry_count INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for phone number lookups
CREATE INDEX idx_sms_logs_phone ON public.sms_logs(phone_number);
CREATE INDEX idx_sms_logs_status ON public.sms_logs(status);
CREATE INDEX idx_sms_logs_created_at ON public.sms_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view SMS logs
CREATE POLICY "Admins can view all SMS logs" 
ON public.sms_logs 
FOR SELECT 
USING (public.get_user_role() = 'admin');

-- System can insert SMS logs (via service role)
CREATE POLICY "System can insert SMS logs" 
ON public.sms_logs 
FOR INSERT 
WITH CHECK (true);

-- Add function to send OTP via SMS
CREATE OR REPLACE FUNCTION public.send_otp_sms(
  p_phone_number TEXT,
  p_otp_code TEXT
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  normalized_phone TEXT;
  user_rec RECORD;
  sms_log_id UUID;
BEGIN
  -- Normalize phone number
  normalized_phone := public.normalize_pakistani_phone(p_phone_number);
  
  -- Validate phone number
  IF NOT public.validate_pakistani_phone(normalized_phone) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid Pakistani phone number');
  END IF;
  
  -- Check rate limiting
  IF NOT public.can_request_otp(normalized_phone) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Too many OTP requests. Please wait before trying again.');
  END IF;
  
  -- Get or create user profile
  SELECT * INTO user_rec
  FROM public.profiles
  WHERE normalized_phone = normalized_phone;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Phone number not registered');
  END IF;
  
  -- Update OTP in profile
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
    normalized_phone,
    'otp',
    'OTP sent',
    'pending',
    jsonb_build_object('user_id', user_rec.id, 'otp_length', length(p_otp_code))
  ) RETURNING id INTO sms_log_id;
  
  -- Return success with SMS log ID for edge function to update
  RETURN jsonb_build_object(
    'success', true, 
    'sms_log_id', sms_log_id,
    'phone', normalized_phone,
    'otp_code', p_otp_code
  );
END;
$$;

-- Function to update SMS status after sending
CREATE OR REPLACE FUNCTION public.update_sms_status(
  p_sms_log_id UUID,
  p_status TEXT,
  p_provider_message_id TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_cost DECIMAL DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.sms_logs
  SET 
    status = p_status,
    provider_message_id = COALESCE(p_provider_message_id, provider_message_id),
    error_message = p_error_message,
    cost = COALESCE(p_cost, cost),
    sent_at = CASE WHEN p_status = 'sent' THEN NOW() ELSE sent_at END,
    delivered_at = CASE WHEN p_status = 'delivered' THEN NOW() ELSE delivered_at END
  WHERE id = p_sms_log_id;
END;
$$;