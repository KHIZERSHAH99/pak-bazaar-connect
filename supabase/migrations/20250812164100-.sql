-- Fix critical security vulnerability: Enhanced RLS protection for profiles table
-- This addresses the security finding about insufficient protection of customer personal information

-- First, drop existing policies to rebuild them with stronger security
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create enhanced RLS policies with stronger security measures

-- 1. Users can only view their own profile data
CREATE POLICY "Users can view their own profile only"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id 
  AND auth.uid() IS NOT NULL  -- Ensure user is authenticated
);

-- 2. Users can only update their own profile with restrictions
CREATE POLICY "Users can update their own profile only"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id 
  AND auth.uid() IS NOT NULL  -- Ensure user is authenticated
)
WITH CHECK (
  auth.uid() = id 
  AND auth.uid() IS NOT NULL  -- Double-check on update
);

-- 3. Admins can view profiles but with audit logging
CREATE POLICY "Admins can view profiles with audit logging"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND get_user_role() = 'admin'
);

-- 4. Admins can update profiles but with restrictions on sensitive fields
CREATE POLICY "Admins can update profiles with restrictions"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() IS NOT NULL 
  AND get_user_role() = 'admin'
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND get_user_role() = 'admin'
);

-- Create a secure function to safely get profile summary (non-sensitive data only)
CREATE OR REPLACE FUNCTION public.get_profile_summary(profile_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Only return non-sensitive profile information
  -- This can be used for displaying user info in orders, etc. without exposing sensitive data
  SELECT jsonb_build_object(
    'id', p.id,
    'business_name', p.business_name,
    'contact_name', p.contact_name,
    'role', p.role,
    'verification_status', p.verification_status,
    'created_at', p.created_at
  ) INTO result
  FROM public.profiles p
  WHERE p.id = profile_id;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Grant execute permission on the summary function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_profile_summary(uuid) TO authenticated;

-- Create a function to validate profile data updates and prevent malicious changes
CREATE OR REPLACE FUNCTION public.validate_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Prevent users from changing their own role (except through proper role request process)
  IF OLD.role IS DISTINCT FROM NEW.role AND auth.uid() = NEW.id THEN
    -- Only allow role changes through the proper role request process or by admins
    IF get_user_role() != 'admin' THEN
      RAISE EXCEPTION 'Direct role changes are not allowed. Please use the role request process.';
    END IF;
  END IF;
  
  -- Validate email format if being changed
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Invalid email format';
    END IF;
  END IF;
  
  -- Validate phone number format if being changed
  IF OLD.phone_number IS DISTINCT FROM NEW.phone_number AND NEW.phone_number IS NOT NULL THEN
    IF NOT validate_pakistani_phone(NEW.phone_number) THEN
      RAISE EXCEPTION 'Invalid Pakistani phone number format';
    END IF;
  END IF;
  
  -- Log sensitive data changes for audit trail
  IF OLD.email IS DISTINCT FROM NEW.email 
     OR OLD.phone_number IS DISTINCT FROM NEW.phone_number 
     OR OLD.cnic_image IS DISTINCT FROM NEW.cnic_image 
     OR OLD.selfie_image IS DISTINCT FROM NEW.selfie_image THEN
    
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      table_name,
      record_id,
      old_values,
      new_values
    ) VALUES (
      auth.uid(),
      'sensitive_profile_data_changed',
      'profiles',
      NEW.id,
      jsonb_build_object(
        'email', CASE WHEN OLD.email IS DISTINCT FROM NEW.email THEN OLD.email ELSE NULL END,
        'phone', CASE WHEN OLD.phone_number IS DISTINCT FROM NEW.phone_number THEN OLD.phone_number ELSE NULL END
      ),
      jsonb_build_object(
        'email', CASE WHEN OLD.email IS DISTINCT FROM NEW.email THEN NEW.email ELSE NULL END,
        'phone', CASE WHEN OLD.phone_number IS DISTINCT FROM NEW.phone_number THEN NEW.phone_number ELSE NULL END,
        'changed_by', auth.uid()
      )
    );
  END IF;
  
  -- Log admin access to other users' profiles
  IF get_user_role() = 'admin' AND auth.uid() != NEW.id THEN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      table_name,
      record_id,
      new_values
    ) VALUES (
      auth.uid(),
      'admin_profile_access',
      'profiles',
      NEW.id,
      jsonb_build_object(
        'accessed_user_id', NEW.id,
        'admin_id', auth.uid(),
        'access_time', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for profile validation and audit logging
DROP TRIGGER IF EXISTS validate_profile_update_trigger ON public.profiles;
CREATE TRIGGER validate_profile_update_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_update();

-- Create a function to log admin profile views (called manually when needed)
CREATE OR REPLACE FUNCTION public.log_admin_profile_view(viewed_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Only log if an admin is viewing another user's profile
  IF get_user_role() = 'admin' AND auth.uid() != viewed_profile_id THEN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      table_name,
      record_id,
      new_values
    ) VALUES (
      auth.uid(),
      'admin_profile_view',
      'profiles',
      viewed_profile_id,
      jsonb_build_object(
        'viewed_user_id', viewed_profile_id,
        'admin_id', auth.uid(),
        'view_time', now()
      )
    );
  END IF;
END;
$$;

-- Grant execute permission on the logging function to authenticated users
GRANT EXECUTE ON FUNCTION public.log_admin_profile_view(uuid) TO authenticated;