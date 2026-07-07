
-- Fix ERROR: privilege escalation via admin_sessions_own policy
DROP POLICY IF EXISTS admin_sessions_own ON public.admin_sessions;

CREATE POLICY admin_sessions_own_select
ON public.admin_sessions
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

-- Fix WARN: pricing_tiers exposed for inactive/unapproved products
DROP POLICY IF EXISTS "Anyone can view pricing tiers" ON public.pricing_tiers;

CREATE POLICY "Anyone can view pricing tiers for active products"
ON public.pricing_tiers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = pricing_tiers.product_id
      AND p.is_active = true
      AND (p.verification_status = 'approved' OR p.verification_status IS NULL)
  )
);
