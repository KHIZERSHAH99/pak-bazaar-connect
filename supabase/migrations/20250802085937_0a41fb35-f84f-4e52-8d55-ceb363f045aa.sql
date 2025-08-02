-- Fix RLS policy for products table to allow public read access to approved products
DROP POLICY IF EXISTS "Allow public to view approved products" ON products;

CREATE POLICY "Allow public to view approved products" 
ON products 
FOR SELECT 
USING (
  is_active = true 
  AND verification_status = 'approved'
);