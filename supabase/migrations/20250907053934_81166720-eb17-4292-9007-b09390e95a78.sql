-- First recreate the get_user_role function that was missing
CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT COALESCE(role, 'pending') FROM public.profiles WHERE id = auth.uid();
$function$;

-- Now we can run the sync function
SELECT sync_auth_profiles();