
-- =========================================================================
-- Migration 3: payment_methods_buyer_safe view
-- =========================================================================

-- View excluding encrypted bytea blobs. Inherits RLS from the underlying
-- table via security_invoker so existing buyer-with-order rule applies.
DROP VIEW IF EXISTS public.payment_methods_buyer_safe;

CREATE VIEW public.payment_methods_buyer_safe
WITH (security_invoker = true) AS
SELECT
  id,
  wholesaler_id,
  bank_name,
  account_title,
  account_number,
  account_number_masked,
  jazzcash_number,
  jazzcash_masked,
  easypaisa_number,
  easypaisa_masked,
  is_active,
  created_at,
  updated_at
FROM public.payment_methods;

GRANT SELECT ON public.payment_methods_buyer_safe TO authenticated;

COMMENT ON VIEW public.payment_methods_buyer_safe IS
  'Payment methods view for buyers — excludes encrypted bytea fields. RLS inherited from payment_methods (buyer must have an order with the wholesaler).';

-- =========================================================================
-- Migration 4: profile_otps — isolated OTP storage
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.profile_otps (
  user_id          uuid PRIMARY KEY,
  otp_code         text,
  otp_expires_at   timestamptz,
  otp_attempts     integer DEFAULT 0,
  verification_otp text,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_otps ENABLE ROW LEVEL SECURITY;

-- Deny-all policy: no role (authenticated/anon) can read or modify directly.
-- Only SECURITY DEFINER functions running as table owner can touch this data.
CREATE POLICY "profile_otps_no_direct_access"
  ON public.profile_otps
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

-- Copy any existing OTP data over before dropping columns.
INSERT INTO public.profile_otps (user_id, otp_code, otp_expires_at, otp_attempts, verification_otp)
SELECT id, otp_code, otp_expires_at, COALESCE(otp_attempts, 0), verification_otp
FROM public.profiles
WHERE otp_code IS NOT NULL
   OR otp_expires_at IS NOT NULL
   OR otp_attempts IS NOT NULL
   OR verification_otp IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Drop the now-redundant columns from profiles.
ALTER TABLE public.profiles DROP COLUMN IF EXISTS otp_code;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS otp_expires_at;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS otp_attempts;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS verification_otp;

COMMENT ON TABLE public.profile_otps IS
  'OTP storage isolated from profiles. Direct reads/writes denied by RLS — only SECURITY DEFINER functions may access.';
