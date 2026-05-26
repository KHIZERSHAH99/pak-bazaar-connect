
-- Tighten storage INSERT policies to enforce path-based ownership
DROP POLICY IF EXISTS "Authenticated users can upload shop images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ad images" ON storage.objects;

CREATE POLICY "Users can upload shop images to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'shop_images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload product images to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'product_images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload ad images to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'ad_images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Explicit DELETE/UPDATE policies for these three buckets (path-scoped)
CREATE POLICY "Users can update own shop images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'shop_images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own shop images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'shop_images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own product images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'product_images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own product images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'product_images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own ad images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'ad_images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own ad images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'ad_images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
