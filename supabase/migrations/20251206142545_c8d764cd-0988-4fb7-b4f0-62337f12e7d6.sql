-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Buyers with active orders can view payment methods" ON payment_methods;

-- Create a new policy that allows any authenticated user to view active payment methods
-- This is necessary because buyers need to see payment methods BEFORE placing their first order
CREATE POLICY "Authenticated users can view active payment methods"
ON payment_methods
FOR SELECT
USING (
  is_active = true 
  AND auth.uid() IS NOT NULL
);

-- Note: This is safe because:
-- 1. Only active payment methods are shown
-- 2. Users must be authenticated 
-- 3. Sensitive account numbers should be masked in the application layer
-- 4. Payment methods only show bank name, account title, and mobile wallet numbers which are needed for payment