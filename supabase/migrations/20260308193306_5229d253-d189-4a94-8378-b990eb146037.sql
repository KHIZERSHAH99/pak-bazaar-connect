
-- Fix security definer view warning
CREATE OR REPLACE VIEW public.shops_public_safe
WITH (security_invoker = true)
AS
SELECT
  id, name, logo, contact, address, postal_code, city_id, created_at, owner_id
FROM public.shops;
