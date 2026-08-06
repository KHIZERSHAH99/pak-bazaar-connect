-- Data API grants that were missing
GRANT SELECT ON public.product_pricing_tiers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_pricing_tiers TO authenticated;
GRANT ALL ON public.product_pricing_tiers TO service_role;

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

-- Tighten tier visibility: active AND approved products only
DROP POLICY IF EXISTS "Anyone can view pricing tiers" ON public.product_pricing_tiers;
CREATE POLICY "Anyone can view pricing tiers for approved products"
ON public.product_pricing_tiers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_pricing_tiers.product_id
      AND p.is_active = true
      AND (p.verification_status = 'approved' OR p.verification_status IS NULL)
  )
);

-- Drop unused legacy duplicate table (0 rows)
DROP TABLE IF EXISTS public.pricing_tiers;