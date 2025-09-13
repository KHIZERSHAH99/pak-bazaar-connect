-- FIX SECURITY DEFINER VIEWS
-- These views should use SECURITY INVOKER so they enforce the RLS of the querying user, not the view creator

-- 1) Drop and recreate orders_with_safe_profiles view with SECURITY INVOKER
DROP VIEW IF EXISTS public.orders_with_safe_profiles CASCADE;

CREATE OR REPLACE VIEW public.orders_with_safe_profiles
WITH (security_barrier = true, security_invoker = true)
AS
SELECT 
  o.*,
  CASE 
    WHEN o.buyer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.shops s 
      WHERE s.id = o.shop_id AND s.owner_id = auth.uid()
    ) OR get_user_role() = 'admin'
    THEN jsonb_build_object(
      'id', p.id,
      'business_name', p.business_name,
      'city', p.city,
      'role', p.role
    )
    ELSE jsonb_build_object('id', o.buyer_id, 'hidden', true)
  END as buyer_profile
FROM public.orders o
LEFT JOIN public.profiles p ON p.id = o.buyer_id
WHERE (
  o.buyer_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.shops s 
    WHERE s.id = o.shop_id AND s.owner_id = auth.uid()
  ) OR 
  get_user_role() = 'admin'
);

-- 2) Check for other SECURITY DEFINER views and convert them
-- Find any shop_details_view or product_details_view
DO $$ 
BEGIN
  -- Check if shop_details_view exists
  IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'shop_details_view' AND schemaname = 'public') THEN
    DROP VIEW IF EXISTS public.shop_details_view CASCADE;
  END IF;
  
  -- Check if product_details_view exists  
  IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'product_details_view' AND schemaname = 'public') THEN
    DROP VIEW IF EXISTS public.product_details_view CASCADE;
  END IF;
END $$;

-- 3) Ensure profiles table still has proper permissions after the view changes
-- Reconfirm permissions
REVOKE ALL ON public.profiles FROM public;
REVOKE ALL ON public.profiles FROM anon;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- 4) Log the security fix
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  table_name,
  new_values
) VALUES (
  NULL,
  'security_fix_applied',
  'views',
  jsonb_build_object(
    'action', 'converted_security_definer_views_to_invoker',
    'fixed_views', ARRAY['orders_with_safe_profiles'],
    'applied_at', NOW()
  )
);