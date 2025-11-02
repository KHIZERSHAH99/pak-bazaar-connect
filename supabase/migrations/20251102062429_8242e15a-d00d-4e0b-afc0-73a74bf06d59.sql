-- Update payment-screenshots bucket size limit to 5MB
UPDATE storage.buckets 
SET file_size_limit = 5242880  -- 5MB in bytes
WHERE id = 'payment-screenshots';