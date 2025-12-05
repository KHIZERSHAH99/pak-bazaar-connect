-- Drop the overly permissive public access policy
DROP POLICY IF EXISTS "Public can view active payment methods" ON public.payment_methods;

-- Create new policy: Only buyers with pending/confirmed orders can view payment methods
-- This allows them to see where to send payment, but restricts access otherwise
CREATE POLICY "Buyers with active orders can view payment methods"
ON public.payment_methods
FOR SELECT
USING (
  is_active = true 
  AND EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.shops s ON o.shop_id = s.id
    WHERE s.owner_id = payment_methods.wholesaler_id
    AND o.buyer_id = auth.uid()
    AND o.status IN ('pending', 'confirmed', 'processing', 'packed', 'shipped')
    AND o.created_at > NOW() - INTERVAL '30 days'
  )
);

-- Add comment explaining the security rationale
COMMENT ON POLICY "Buyers with active orders can view payment methods" ON public.payment_methods IS 
'Restricts payment method visibility to only buyers who have active orders with the wholesaler. This prevents public exposure of bank account numbers and mobile wallet numbers while still allowing legitimate buyers to see payment details.';