-- Create OTP verifications table
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  attempts_count INTEGER DEFAULT 0,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX idx_otp_phone_expires ON public.otp_verifications(phone_number, expires_at);

-- Enable RLS
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for OTP verifications
CREATE POLICY "Users can view their own OTP records" ON public.otp_verifications
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "System can insert OTP records" ON public.otp_verifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update OTP records" ON public.otp_verifications
  FOR UPDATE USING (true);

-- Add phone_verified column to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.otp_verifications 
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$;