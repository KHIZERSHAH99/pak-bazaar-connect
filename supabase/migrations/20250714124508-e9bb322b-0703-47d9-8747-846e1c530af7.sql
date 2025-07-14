
-- Fix admin account phone number
UPDATE public.profiles 
SET phone_number = '03418337167'
WHERE email = 'admin@test.com' OR phone_number = '03418837167';

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

-- Allow users to insert their own profile images
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;

CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Ensure products can be created with pending verification status
ALTER TABLE public.products 
ALTER COLUMN verification_status SET DEFAULT 'pending';

-- Update any existing null verification_status values
UPDATE public.products 
SET verification_status = 'pending' 
WHERE verification_status IS NULL;
