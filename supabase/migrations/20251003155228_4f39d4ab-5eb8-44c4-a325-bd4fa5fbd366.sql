-- Remove ads storage bucket and its contents
DELETE FROM storage.objects WHERE bucket_id = 'ad-images';
DELETE FROM storage.buckets WHERE id = 'ad-images';