CREATE OR REPLACE FUNCTION public.generate_csrf_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  new_token text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  -- pgcrypto lives in the "extensions" schema; must be schema-qualified
  -- because search_path is intentionally empty.
  new_token := encode(extensions.gen_random_bytes(32), 'hex');

  INSERT INTO public.csrf_tokens (user_id, token, expires_at)
  VALUES (auth.uid(), new_token, NOW() + INTERVAL '1 hour');

  DELETE FROM public.csrf_tokens
  WHERE user_id = auth.uid()
    AND (expires_at < NOW() OR used = true);

  RETURN new_token;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.generate_csrf_token() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_csrf_token() TO authenticated;