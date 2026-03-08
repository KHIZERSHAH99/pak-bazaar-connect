
-- ============================================
-- 1A. Prevent role self-escalation on profiles
-- ============================================
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_self_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_self_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_escalation();

-- ============================================
-- 1B. Restrict payment_methods visibility
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view active payment methods" ON public.payment_methods;

CREATE POLICY "Buyers with orders can view payment methods"
  ON public.payment_methods
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.shops s ON o.shop_id = s.id
      WHERE s.owner_id = payment_methods.wholesaler_id
        AND o.buyer_id = auth.uid()
    )
  );

-- ============================================
-- 1C. Remove overly broad tutorial_views read
-- ============================================
DROP POLICY IF EXISTS "Users can read views" ON public.tutorial_views;

-- ============================================
-- 1D. Create public shops view without commission_rate
-- ============================================
CREATE OR REPLACE VIEW public.shops_public_safe AS
SELECT
  id, name, logo, contact, address, postal_code, city_id, created_at, owner_id
FROM public.shops;

GRANT SELECT ON public.shops_public_safe TO authenticated;
GRANT SELECT ON public.shops_public_safe TO anon;
