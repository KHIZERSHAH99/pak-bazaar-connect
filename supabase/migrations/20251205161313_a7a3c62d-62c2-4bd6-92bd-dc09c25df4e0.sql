-- Fix the security definer view warning by explicitly setting SECURITY INVOKER
-- This ensures the view uses the permissions of the querying user, not the view creator
ALTER VIEW public.shops_public SET (security_invoker = true);

-- Add comment
COMMENT ON VIEW public.shops_public IS 
'Public-safe view of shops table with SECURITY INVOKER. Only exposes id, name, logo, and city_id. Anonymous users can use this for shop browsing while contact details remain protected in the base table.';