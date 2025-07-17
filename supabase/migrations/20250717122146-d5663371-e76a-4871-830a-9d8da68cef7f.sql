-- Fix products RLS policies to allow sellers to see approved products
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Public can view approved active products" ON products;

-- Create new policy for sellers to see all approved and active products
CREATE POLICY "Users can view approved active products" ON products
FOR SELECT
USING (is_active = true AND verification_status = 'approved');

-- Update shop images bucket size limit and make it easier to upload
UPDATE storage.buckets 
SET file_size_limit = 5242880 -- 5MB limit
WHERE id = 'shop_images';

-- Ensure all required storage buckets exist with proper settings
INSERT INTO storage.buckets (id, name, public, file_size_limit) 
VALUES 
('shop_images', 'shop_images', true, 5242880),
('product_images', 'product_images', true, 5242880),
('ad_images', 'ad_images', true, 5242880)
ON CONFLICT (id) DO UPDATE SET
file_size_limit = EXCLUDED.file_size_limit,
public = EXCLUDED.public;