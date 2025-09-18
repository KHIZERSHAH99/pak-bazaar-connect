-- Remove profile image functionality to save storage space

-- 1. Drop profile_image column from profiles table
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS profile_image;

-- 2. Clean up profile-images storage bucket
DELETE FROM storage.objects 
WHERE bucket_id = 'profile-images';

-- 3. Delete the profile-images bucket
DELETE FROM storage.buckets 
WHERE id = 'profile-images';

-- Note: We're keeping cnic_image and selfie_image for verification purposes as they're important for business operations