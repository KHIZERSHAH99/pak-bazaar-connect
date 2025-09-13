-- Minimal hardening for profiles without changing existing logic
-- 1) Ensure RLS is enabled and deny default grants to anon/public
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profiles FROM public;
REVOKE ALL ON public.profiles FROM anon;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- 2) Add partial indexes to support secure queries (performance only)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_normalized_phone ON public.profiles(normalized_phone);

-- 3) Verify existing policies remain intact (no-op if already exist)
-- Note: We do not recreate policies here to avoid downtime.
