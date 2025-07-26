-- Fix RLS policies for orders update to remove references to old.role
DROP POLICY IF EXISTS "Wholesalers can update order status" ON orders;

-- Create new policy for wholesalers to update order status
CREATE POLICY "Wholesalers can update order status"
ON orders
FOR UPDATE
USING (
  shop_id IN (
    SELECT shops.id
    FROM shops
    WHERE shops.owner_id = auth.uid()
  )
);