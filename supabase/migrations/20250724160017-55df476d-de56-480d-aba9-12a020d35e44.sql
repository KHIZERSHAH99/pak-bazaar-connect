-- Allow sellers to view payment methods for wholesalers (needed for order creation)
CREATE POLICY "Sellers can view payment methods for orders" 
ON public.payment_methods 
FOR SELECT 
USING (
  is_active = true AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'seller'
  )
);