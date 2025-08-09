-- Fix phone login and profiles backfill
BEGIN;

-- 1) Ensure handle_new_user creates profile with phone fields when available
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    role,
    phone_number,
    normalized_phone,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'pending'),
    COALESCE(NULLIF(NEW.phone, ''), NEW.raw_user_meta_data->>'phone'),
    public.normalize_pakistani_phone(COALESCE(NULLIF(NEW.phone, ''), NEW.raw_user_meta_data->>'phone')),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2) Create trigger on auth.users to populate profiles on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3) Ensure phone normalization trigger exists on public.profiles
-- Function public.normalize_phone_trigger() already exists per config; attach trigger
DROP TRIGGER IF EXISTS trg_normalize_phone ON public.profiles;
CREATE TRIGGER trg_normalize_phone
  BEFORE INSERT OR UPDATE OF phone_number ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.normalize_phone_trigger();

-- 4) Index to speed up phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_normalized_phone ON public.profiles (normalized_phone);

-- 5) Backfill missing profiles from auth.users
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
SELECT u.id, u.email, 'pending', now(), now()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 6) Migrate phone numbers embedded in email localpart into phone_number
WITH candidates AS (
  SELECT id,
         split_part(email, '@', 1) AS localpart
  FROM public.profiles
  WHERE (phone_number IS NULL OR phone_number = '')
)
UPDATE public.profiles p
SET phone_number = CASE 
                     WHEN public.validate_pakistani_phone(public.normalize_pakistani_phone(c.localpart))
                     THEN public.normalize_pakistani_phone(c.localpart)
                     ELSE p.phone_number
                   END
FROM candidates c
WHERE p.id = c.id;

-- 7) Ensure normalized_phone is filled consistently
UPDATE public.profiles
SET normalized_phone = public.normalize_pakistani_phone(phone_number)
WHERE phone_number IS NOT NULL
  AND (normalized_phone IS NULL OR normalized_phone <> public.normalize_pakistani_phone(phone_number));

COMMIT;