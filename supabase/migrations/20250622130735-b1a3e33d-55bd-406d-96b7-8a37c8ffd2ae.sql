
-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-screenshots',
  'payment-screenshots', 
  false,
  102400,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Create RLS policies for payment screenshots bucket
CREATE POLICY "Users can upload payment screenshots"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'payment-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own payment screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Wholesalers can view order screenshots"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-screenshots' 
  AND EXISTS (
    SELECT 1 FROM orders o
    JOIN shops s ON o.shop_id = s.id
    WHERE s.owner_id = auth.uid()
    AND o.payment_screenshot = name
  )
);

-- Add phone number validation and OTP fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS otp_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS otp_attempts INTEGER DEFAULT 0;

-- Create unique constraint on phone numbers to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique 
ON profiles(phone_number) 
WHERE phone_number IS NOT NULL AND phone_number != '';

-- Function to automatically delete old payment screenshots
CREATE OR REPLACE FUNCTION delete_old_payment_screenshots()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete screenshots from orders older than 3 days that are completed
  DELETE FROM storage.objects
  WHERE bucket_id = 'payment-screenshots'
  AND created_at < NOW() - INTERVAL '3 days'
  AND name IN (
    SELECT payment_screenshot 
    FROM orders 
    WHERE payment_screenshot IS NOT NULL 
    AND (status = 'completed' OR created_at < NOW() - INTERVAL '3 days')
  );
  
  -- Clear screenshot references from orders table
  UPDATE orders 
  SET payment_screenshot = NULL
  WHERE payment_screenshot IS NOT NULL 
  AND (status = 'completed' OR created_at < NOW() - INTERVAL '3 days');
END;
$$;

-- Create a scheduled job to run cleanup (note: this requires pg_cron extension)
-- For now, we'll create the function and let the app call it periodically
