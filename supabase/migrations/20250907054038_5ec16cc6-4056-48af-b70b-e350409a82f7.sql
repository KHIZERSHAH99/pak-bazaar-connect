-- First drop the trigger that's causing the issue
DROP TRIGGER IF EXISTS validate_profile_update_trigger ON public.profiles;

-- Create the missing get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT COALESCE(role, 'pending') FROM public.profiles WHERE id = auth.uid();
$function$;

-- Now run the sync function to ensure profiles exist
SELECT sync_auth_profiles();

-- Recreate the trigger if needed
CREATE TRIGGER validate_profile_update_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_update();