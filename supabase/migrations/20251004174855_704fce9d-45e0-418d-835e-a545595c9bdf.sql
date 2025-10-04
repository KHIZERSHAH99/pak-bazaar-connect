-- Fix the log_profile_changes function to use correct log_audit_event signature
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Call log_audit_event with correct parameter types
    PERFORM public.log_audit_event(
      NEW.id,
      'role_changed',
      'profiles',
      NEW.id::TEXT,
      jsonb_build_object('role', OLD.role)::TEXT,
      jsonb_build_object('role', NEW.role)::TEXT,
      NULL::TEXT
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update admin whitelist
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  user_phone text;
BEGIN
  IF NEW.role = 'admin' AND (OLD IS NULL OR OLD.role != 'admin') THEN
    user_email := NEW.email;
    user_phone := NEW.normalized_phone;
    
    -- Allow khizerfight@gmail.com OR phone 03418337167
    IF COALESCE(user_email, '') != 'khizerfight@gmail.com' AND COALESCE(user_phone, '') != '03418337167' THEN
      RAISE EXCEPTION 'Only authorized users can have admin role';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Now update the user role
UPDATE public.profiles 
SET role = 'admin'
WHERE normalized_phone = '03418337167' OR phone_number = '03418337167';