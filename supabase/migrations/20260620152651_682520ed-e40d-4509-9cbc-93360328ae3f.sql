
-- Restrict payment_methods buyer visibility to ACTIVE orders only
DROP POLICY IF EXISTS "Buyers with orders can view payment methods" ON public.payment_methods;

CREATE POLICY "Buyers with active orders can view payment methods"
ON public.payment_methods
FOR SELECT
TO authenticated
USING (
  is_active = true
  AND EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.shops s ON o.shop_id = s.id
    WHERE s.owner_id = payment_methods.wholesaler_id
      AND o.buyer_id = auth.uid()
      AND o.status IN ('pending', 'confirmed', 'processing', 'awaiting_payment', 'payment_uploaded', 'shipped')
  )
);

-- Restrict password policy config reads to authenticated users (prevents anon enumeration)
DROP POLICY IF EXISTS "Anyone can read password policy" ON public.password_policy_config;

CREATE POLICY "Authenticated users can read password policy"
ON public.password_policy_config
FOR SELECT
TO authenticated
USING (true);

REVOKE SELECT ON public.password_policy_config FROM anon;
