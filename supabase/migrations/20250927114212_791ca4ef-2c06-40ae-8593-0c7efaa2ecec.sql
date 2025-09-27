-- Ensure all public views run with invoker rights (fixes SECURITY DEFINER view finding)
-- Postgres 15+ supports the security_invoker view option
DO $$
BEGIN
  -- commission_summary_secure
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'commission_summary_secure'
  ) THEN
    EXECUTE 'ALTER VIEW public.commission_summary_secure SET (security_invoker = true)';
  END IF;

  -- orders_with_safe_profiles
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'orders_with_safe_profiles'
  ) THEN
    EXECUTE 'ALTER VIEW public.orders_with_safe_profiles SET (security_invoker = true)';
  END IF;

  -- profiles_public
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'profiles_public'
  ) THEN
    EXECUTE 'ALTER VIEW public.profiles_public SET (security_invoker = true)';
  END IF;

  -- public_wholesaler_profiles
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'public_wholesaler_profiles'
  ) THEN
    EXECUTE 'ALTER VIEW public.public_wholesaler_profiles SET (security_invoker = true)';
  END IF;

  -- security_metrics
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'security_metrics'
  ) THEN
    EXECUTE 'ALTER VIEW public.security_metrics SET (security_invoker = true)';
  END IF;
END $$;