
-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', false);

-- Create storage policies for payment screenshots
CREATE POLICY "Users can upload payment screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own payment screenshots"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Wholesalers can view order payment screenshots"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-screenshots' 
  AND EXISTS (
    SELECT 1 FROM orders o
    JOIN shops s ON o.shop_id = s.id
    WHERE s.owner_id = auth.uid()
    AND o.payment_screenshot = name
  )
);
