-- Check and update storage policies for payment-screenshots bucket
-- First, ensure the bucket exists and has proper policies

-- Update the RLS policy for payment-screenshots to allow authenticated users to read
CREATE POLICY IF NOT EXISTS "Authenticated users can view payment screenshots" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'payment-screenshots' 
  AND auth.role() = 'authenticated'
);

-- Allow order participants (buyer or shop owner) to access payment screenshots
CREATE POLICY IF NOT EXISTS "Order participants can access payment screenshots" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'payment-screenshots' 
  AND (
    -- Allow if user is the buyer (file path starts with their user ID)
    auth.uid()::text = split_part(name, '/', 1)
    OR
    -- Allow if user owns a shop that has orders with this screenshot
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.shops s ON o.shop_id = s.id
      WHERE s.owner_id = auth.uid()
      AND o.payment_screenshot = storage.objects.name
    )
  )
);

-- Clean up orders with missing payment screenshots (optional - run this if you want to clean up)
-- UPDATE public.orders 
-- SET payment_screenshot = NULL
-- WHERE payment_screenshot IS NOT NULL 
-- AND NOT EXISTS (
--   SELECT 1 FROM storage.objects 
--   WHERE bucket_id = 'payment-screenshots' 
--   AND name = orders.payment_screenshot
-- );