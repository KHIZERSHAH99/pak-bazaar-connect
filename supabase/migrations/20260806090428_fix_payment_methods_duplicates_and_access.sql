-- Prevent duplicate payment method rows per wholesaler
CREATE UNIQUE INDEX IF NOT EXISTS payment_methods_wholesaler_id_unique
ON public.payment_methods (wholesaler_id);

-- Allow buyers to view active payment methods for any shop, not just shops
-- where they already have an active order. This is needed so buyers can see
-- payment options when creating a new order. The buyer_safe view masks
-- sensitive account numbers, but the base table policy also needs to allow
-- reads of active methods so the view (which inherits owner permissions)
-- returns rows.
DROP POLICY IF EXISTS "Buyers can view active payment methods for shops" ON public.payment_methods;

CREATE POLICY "Buyers can view active payment methods for shops"
ON public.payment_methods
FOR SELECT
TO authenticated
USING (is_active = true);
