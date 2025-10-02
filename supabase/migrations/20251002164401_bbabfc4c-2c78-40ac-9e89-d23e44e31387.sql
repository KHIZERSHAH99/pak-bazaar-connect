-- Allow public to view active payment methods (sellers need to see them to place orders)
DROP POLICY IF EXISTS "Public can view active payment methods" ON payment_methods;

CREATE POLICY "Public can view active payment methods"
ON payment_methods
FOR SELECT
TO anon, authenticated
USING (is_active = true);