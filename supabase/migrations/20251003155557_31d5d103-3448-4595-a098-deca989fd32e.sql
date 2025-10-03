-- Remove ad_images storage bucket and its contents (correct bucket name)
DELETE FROM storage.objects WHERE bucket_id = 'ad_images';
DELETE FROM storage.buckets WHERE id = 'ad_images';