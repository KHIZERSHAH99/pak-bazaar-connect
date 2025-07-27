-- Create proper storage policies for payment-screenshots bucket
DROP POLICY IF EXISTS "Authenticated users can view payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Order participants can access payment screenshots" ON storage.objects;

-- Allow order participants to view payment screenshots
CREATE POLICY "Order participants can view payment screenshots" 
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