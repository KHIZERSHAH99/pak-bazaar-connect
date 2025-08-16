-- Create the missing get_user_role function that's being referenced
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Now update existing phone user data in profiles table
UPDATE public.profiles 
SET 
  phone_number = CASE 
    WHEN email LIKE '%@temp-phone-auth.com' THEN 
      REPLACE(email, '@temp-phone-auth.com', '')
    WHEN email LIKE '%@phone.auth.local' THEN
      REPLACE(email, '@phone.auth.local', '')
    ELSE phone_number
  END,
  normalized_phone = CASE 
    WHEN email LIKE '%@temp-phone-auth.com' THEN 
      public.normalize_pakistani_phone(REPLACE(email, '@temp-phone-auth.com', ''))
    WHEN email LIKE '%@phone.auth.local' THEN
      public.normalize_pakistani_phone(REPLACE(email, '@phone.auth.local', ''))
    ELSE normalized_phone
  END
WHERE email LIKE '%@temp-phone-auth.com' 
   OR email LIKE '%@phone.auth.local';

-- Log the cleanup
INSERT INTO public.audit_logs (user_id, event_type, table_name, new_values)
VALUES (
  NULL,
  'phone_data_cleanup',
  'profiles',
  jsonb_build_object(
    'action', 'cleaned_phone_user_data',
    'timestamp', now()
  )
);