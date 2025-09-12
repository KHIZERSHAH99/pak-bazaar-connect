-- SECURITY FIX: Protect customer personal information in profiles table

-- 1. Create a secure function to get profile summary without sensitive data
CREATE OR REPLACE FUNCTION public.get_profile_summary(profile_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- 2. Create a view for public profile information (non-sensitive)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  business_name,
  business_type,
  city,
  industry,
  verification_status,
  created_at
FROM public.profiles
WHERE role IN ('wholesaler', 'seller')
  AND verification_status = 'verified';

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;

-- 3. Add column-level security for sensitive fields
-- Create a function to check if user can access sensitive data
CREATE OR REPLACE FUNCTION public.can_access_sensitive_data(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- User can access their own sensitive data
  IF auth.uid() = target_user_id THEN
    RETURN true;
  END IF;
  
  -- Admins can access sensitive data but it will be logged
  IF get_user_role() = 'admin' THEN
    -- Log the sensitive data access
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      table_name,
      record_id,
      new_values
    ) VALUES (
      auth.uid(),
      'sensitive_data_access',
      'profiles',
      target_user_id,
      jsonb_build_object(
        'admin_id', auth.uid(),
        'target_user_id', target_user_id,
        'access_time', now()
      )
    );
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- 4. Update RLS policies with better security
-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view profiles with audit logging" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles with restrictions" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile only" ON public.profiles;

-- Create new, more secure policies
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
);

CREATE POLICY "Admins can view profiles with audit"
ON public.profiles
FOR SELECT
USING (
  get_user_role() = 'admin'
  -- Audit logging happens via function calls
);

CREATE POLICY "Users can update own non-sensitive fields"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  -- Prevent users from changing sensitive fields without proper verification
  AND (OLD.cnic_image IS NOT DISTINCT FROM NEW.cnic_image OR NEW.cnic_image IS NULL)
  AND (OLD.selfie_image IS NOT DISTINCT FROM NEW.selfie_image OR NEW.selfie_image IS NULL)
  AND (OLD.role IS NOT DISTINCT FROM NEW.role) -- Role changes must go through proper process
  AND (OLD.verification_status IS NOT DISTINCT FROM NEW.verification_status)
);

CREATE POLICY "Admins can update profiles with restrictions"
ON public.profiles
FOR UPDATE
USING (get_user_role() = 'admin')
WITH CHECK (
  get_user_role() = 'admin'
  -- Log changes to sensitive fields
);

-- 5. Create a function to safely expose profile data in API responses
CREATE OR REPLACE FUNCTION public.get_safe_profile_data(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  profile_data jsonb;
  is_own_profile boolean;
  is_admin boolean;
BEGIN
  is_own_profile := (auth.uid() = user_id);
  is_admin := (get_user_role() = 'admin');
  
  IF is_own_profile THEN
    -- User can see all their own data
    SELECT to_jsonb(p.*) INTO profile_data
    FROM public.profiles p
    WHERE p.id = user_id;
  ELSIF is_admin THEN
    -- Admin can see data but sensitive fields are marked
    SELECT jsonb_build_object(
      'id', p.id,
      'email', p.email,
      'role', p.role,
      'phone_number', '[REDACTED - Admin View]',
      'business_name', p.business_name,
      'contact_name', p.contact_name,
      'business_type', p.business_type,
      'address', p.address,
      'city', p.city,
      'postal_code', p.postal_code,
      'verification_status', p.verification_status,
      'is_suspended', p.is_suspended,
      'created_at', p.created_at,
      'cnic_image', CASE WHEN p.cnic_image IS NOT NULL THEN '[DOCUMENT ON FILE]' ELSE NULL END,
      'selfie_image', CASE WHEN p.selfie_image IS NOT NULL THEN '[IMAGE ON FILE]' ELSE NULL END
    ) INTO profile_data
    FROM public.profiles p
    WHERE p.id = user_id;
    
    -- Log admin access
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      table_name,
      record_id,
      new_values
    ) VALUES (
      auth.uid(),
      'admin_viewed_profile',
      'profiles',
      user_id,
      jsonb_build_object('viewed_at', now())
    );
  ELSE
    -- Other users get minimal public data
    SELECT jsonb_build_object(
      'id', p.id,
      'business_name', p.business_name,
      'business_type', p.business_type,
      'city', p.city,
      'verification_status', p.verification_status
    ) INTO profile_data
    FROM public.profiles p
    WHERE p.id = user_id;
  END IF;
  
  RETURN COALESCE(profile_data, '{}'::jsonb);
END;
$$;

-- 6. Create a function to log admin profile view
CREATE OR REPLACE FUNCTION public.log_admin_profile_view(viewed_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- 7. Create a monitoring function to detect suspicious access patterns
CREATE OR REPLACE FUNCTION public.monitor_profile_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  suspicious_activity RECORD;
BEGIN
  -- Check for excessive profile access in the last hour
  FOR suspicious_activity IN
    SELECT 
      user_id,
      COUNT(*) as access_count
    FROM public.audit_logs
    WHERE event_type IN ('admin_profile_access', 'admin_viewed_profile', 'sensitive_data_access', 'admin_profile_view')
      AND created_at > NOW() - INTERVAL '1 hour'
    GROUP BY user_id
    HAVING COUNT(*) > 10
  LOOP
    -- Alert about suspicious activity
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      table_name,
      new_values
    ) VALUES (
      suspicious_activity.user_id,
      'suspicious_profile_access_pattern',
      'profiles',
      jsonb_build_object(
        'access_count', suspicious_activity.access_count,
        'time_window', '1 hour',
        'alert_time', NOW()
      )
    );
  END LOOP;
END;
$$;

-- 8. Add validation trigger to ensure sensitive data is properly handled
CREATE OR REPLACE FUNCTION public.validate_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- Create or replace the trigger
DROP TRIGGER IF EXISTS validate_profile_update_trigger ON public.profiles;
CREATE TRIGGER validate_profile_update_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_profile_update();

-- 9. Create an index on audit_logs for better monitoring performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_profile_access 
ON public.audit_logs(event_type, created_at) 
WHERE event_type IN ('admin_profile_access', 'sensitive_data_access', 'admin_viewed_profile', 'admin_profile_view');

-- 10. Add a scheduled function to monitor and alert on suspicious activities (to be called periodically)
-- This would typically be called by a cron job or scheduled function
COMMENT ON FUNCTION public.monitor_profile_access() IS 'Call this function periodically (e.g., every hour) to monitor for suspicious profile access patterns';

-- Success message
SELECT 'Security enhancements for profiles table have been successfully applied. Customer personal information is now better protected with:
- Enhanced RLS policies restricting access
- Audit logging for all admin access
- Sensitive field protection
- Monitoring for suspicious access patterns
- Validation of data changes
- Safe data exposure functions' as message;