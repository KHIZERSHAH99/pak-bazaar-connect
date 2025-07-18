-- Update all existing products to be approved since we're removing the approval requirement
UPDATE public.products 
SET verification_status = 'approved' 
WHERE verification_status = 'pending';