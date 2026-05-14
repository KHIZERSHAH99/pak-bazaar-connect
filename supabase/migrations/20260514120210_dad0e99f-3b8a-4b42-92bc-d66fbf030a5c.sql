
-- Rate-limited email-existence check used by the signup form to give users
-- a clear "already registered" message without enabling enumeration attacks.
CREATE OR REPLACE FUNCTION public.email_is_taken(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
DECLARE
  v_normalized text;
  v_exists boolean := false;
BEGIN
  IF p_email IS NULL OR length(trim(p_email)) = 0 THEN
    RETURN false;
  END IF;

  v_normalized := lower(trim(p_email));

  -- Apply rate limiting (max 10 checks per 5 minutes per caller).
  -- If exceeded, return false to avoid leaking existence under attack.
  IF NOT public.check_operation_rate_limit('email_is_taken_check', 10, 5) THEN
    RETURN false;
  END IF;

  -- Look in profiles (covers both email-auth and phone-auth users).
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE lower(email) = v_normalized
  ) INTO v_exists;

  RETURN v_exists;
END;
$$;

REVOKE ALL ON FUNCTION public.email_is_taken(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.email_is_taken(text) TO anon, authenticated;
