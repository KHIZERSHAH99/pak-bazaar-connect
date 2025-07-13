
-- Update the admin account phone number and role
UPDATE public.profiles 
SET phone_number = '03418337167', role = 'admin'
WHERE phone_number = '03418837167';

-- Fix profile image upload RLS policy - allow users to update their own profile images
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;

CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Ensure products are visible by updating RLS policies
DROP POLICY IF EXISTS "Anyone can view approved active products" ON public.products;

CREATE POLICY "Anyone can view approved active products" 
ON public.products FOR SELECT
USING (is_active = true AND (verification_status = 'approved' OR verification_status IS NULL));

-- Allow shops to be updated by their owners
DROP POLICY IF EXISTS "Wholesaler can update their own shops" ON public.shops;
DROP POLICY IF EXISTS "Wholesalers can update their own shops" ON public.shops;

CREATE POLICY "Shop owners can update their shops"
ON public.shops FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());
