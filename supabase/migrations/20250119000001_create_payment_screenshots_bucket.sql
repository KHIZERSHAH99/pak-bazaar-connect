
-- Create payment screenshots storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-screenshots',
  'payment-screenshots', 
  false,
  102400, -- 100KB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Create RLS policies for payment screenshots
CREATE POLICY "Users can upload their own payment screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own payment screenshots"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Wholesalers can view screenshots from their orders"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-screenshots' 
  AND EXISTS (
    SELECT 1 FROM orders o
    JOIN shops s ON o.shop_id = s.id
    WHERE o.payment_screenshot = name
    AND s.owner_id = auth.uid()
  )
);
