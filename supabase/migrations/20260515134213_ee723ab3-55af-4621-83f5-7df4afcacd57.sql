
-- =========================================================
-- Migration 5: Safe public views + sensitive-contact helpers
-- =========================================================

-- Drop and recreate to ensure correct columns (security_invoker so RLS still applies)
DROP VIEW IF EXISTS public.shops_public_safe CASCADE;
CREATE VIEW public.shops_public_safe
WITH (security_invoker = true) AS
SELECT id, owner_id, name, logo, address, postal_code, city_id, commission_rate, created_at
FROM public.shops;

GRANT SELECT ON public.shops_public_safe TO anon, authenticated;

DROP VIEW IF EXISTS public.company_profiles_public_safe CASCADE;
CREATE VIEW public.company_profiles_public_safe
WITH (security_invoker = true) AS
SELECT id, user_id, company_name, logo, description, website, city_id, address,
       business_type, verification_status, created_at, updated_at
FROM public.company_profiles
WHERE verification_status = 'approved';

GRANT SELECT ON public.company_profiles_public_safe TO anon, authenticated;

-- Helper: get shop contact only if caller is owner / admin / buyer with order
CREATE OR REPLACE FUNCTION public.get_shop_contact(p_shop_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_contact text;
  v_owner uuid;
BEGIN
  IF v_uid IS NULL THEN RETURN NULL; END IF;

  SELECT owner_id, contact INTO v_owner, v_contact
  FROM public.shops WHERE id = p_shop_id;

  IF v_owner = v_uid THEN RETURN v_contact; END IF;
  IF public.get_user_role() = 'admin' THEN RETURN v_contact; END IF;

  IF EXISTS (
    SELECT 1 FROM public.orders
    WHERE shop_id = p_shop_id AND buyer_id = v_uid
  ) THEN
    RETURN v_contact;
  END IF;

  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.get_shop_contact(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shop_contact(uuid) TO authenticated;

-- Helper: get company contact (phone/whatsapp) - owner or admin only
CREATE OR REPLACE FUNCTION public.get_company_contact(p_user_id uuid)
RETURNS TABLE(phone text, whatsapp text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RETURN; END IF;
  IF v_uid <> p_user_id AND public.get_user_role() <> 'admin' THEN RETURN; END IF;

  RETURN QUERY
  SELECT cp.phone, cp.whatsapp
  FROM public.company_profiles cp
  WHERE cp.user_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_company_contact(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_company_contact(uuid) TO authenticated;

-- =========================================================
-- Migration 6: REVOKE EXECUTE on internal SECURITY DEFINER functions
-- =========================================================
-- Strategy: revoke EXECUTE from PUBLIC/anon/authenticated on internal-only
-- functions. Keep the curated public/auth list intact.

DO $$
DECLARE
  -- Functions that MUST stay callable by anon/authenticated from the client
  keep_callable text[] := ARRAY[
    'check_phone_exists',
    'email_is_taken',
    'authenticate_user_by_phone',
    'get_user_by_phone',
    'check_user_exists',
    'log_audit_event',
    'secure_insert_audit_log',
    'secure_insert_analytics_event',
    'get_product_analytics',
    'track_product_view',
    'increment_coupon_usage',
    'generate_csrf_token',
    'validate_csrf_token',
    'check_rate_limit',
    'log_security_event',
    'calculate_shipping_cost',
    'switch_business_role',
    'has_role',
    'get_user_role',
    'get_effective_user_role',
    'mask_sensitive_data',
    'get_safe_profile_data',
    'get_safe_profile_summary',
    'get_profile_summary',
    'get_public_profile_info',
    'get_public_shop_info',
    'get_active_products_list',
    'get_available_phones',
    'get_payment_methods_secure',
    'get_secure_payment_methods',
    'get_order_details_secure',
    'get_shop_contact',
    'get_company_contact',
    -- Edge-function-callable
    'secure_check_rate_limit',
    'cleanup_old_screenshots',
    'get_storage_stats',
    'run_all_cleanups'
  ];
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    IF NOT (fn.proname = ANY(keep_callable)) THEN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM PUBLIC, anon, authenticated',
                     fn.proname, fn.args);
    END IF;
  END LOOP;
END $$;

-- =========================================================
-- Storage: remove bucket listing for public image buckets
-- =========================================================
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
