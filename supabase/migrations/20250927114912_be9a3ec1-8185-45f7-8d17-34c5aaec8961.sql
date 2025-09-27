-- Fix search_path for all database functions to prevent manipulation attacks
-- This migration adds SET search_path = public to all functions that don't have it

-- 1. get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT COALESCE(role, 'pending') FROM public.profiles WHERE id = auth.uid();
$function$;

-- 2. validate_profile_update  
CREATE OR REPLACE FUNCTION public.validate_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Prevent regular users from changing sensitive fields
  IF auth.uid() = NEW.id AND get_user_role() != 'admin' THEN
    -- Prevent role changes
    IF OLD.role IS DISTINCT FROM NEW.role THEN
      RAISE EXCEPTION 'Direct role changes are not allowed. Please use the role request process.';
    END IF;
    
    -- Prevent verification status changes
    IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
      RAISE EXCEPTION 'Cannot change verification status directly.';
    END IF;
    
    -- Prevent changing CNIC/selfie images without proper verification
    IF OLD.cnic_image IS DISTINCT FROM NEW.cnic_image AND NEW.cnic_image IS NOT NULL THEN
      RAISE EXCEPTION 'CNIC image can only be updated through verification process.';
    END IF;
    
    IF OLD.selfie_image IS DISTINCT FROM NEW.selfie_image AND NEW.selfie_image IS NOT NULL THEN
      RAISE EXCEPTION 'Selfie image can only be updated through verification process.';
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
        'phone', CASE WHEN OLD.phone_number IS DISTINCT FROM NEW.phone_number THEN OLD.phone_number ELSE NULL END,
        'has_cnic', CASE WHEN OLD.cnic_image IS DISTINCT FROM NEW.cnic_image THEN (OLD.cnic_image IS NOT NULL) ELSE NULL END,
        'has_selfie', CASE WHEN OLD.selfie_image IS DISTINCT FROM NEW.selfie_image THEN (OLD.selfie_image IS NOT NULL) ELSE NULL END
      ),
      jsonb_build_object(
        'email', CASE WHEN OLD.email IS DISTINCT FROM NEW.email THEN NEW.email ELSE NULL END,
        'phone', CASE WHEN OLD.phone_number IS DISTINCT FROM NEW.phone_number THEN NEW.phone_number ELSE NULL END,
        'has_cnic', CASE WHEN OLD.cnic_image IS DISTINCT FROM NEW.cnic_image THEN (NEW.cnic_image IS NOT NULL) ELSE NULL END,
        'has_selfie', CASE WHEN OLD.selfie_image IS DISTINCT FROM NEW.selfie_image THEN (NEW.selfie_image IS NOT NULL) ELSE NULL END,
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
      'admin_profile_update',
      'profiles',
      NEW.id,
      jsonb_build_object(
        'accessed_user_id', NEW.id,
        'admin_id', auth.uid(),
        'action', 'update',
        'access_time', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. log_admin_profile_view
CREATE OR REPLACE FUNCTION public.log_admin_profile_view(viewed_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- 4. get_safe_profile_data
CREATE OR REPLACE FUNCTION public.get_safe_profile_data(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
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
    PERFORM log_admin_profile_view(user_id);
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
$function$;

-- 5. monitor_profile_access
CREATE OR REPLACE FUNCTION public.monitor_profile_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  suspicious_activity RECORD;
BEGIN
  -- Check for excessive profile access in the last hour
  FOR suspicious_activity IN
    SELECT 
      user_id,
      COUNT(*) as access_count
    FROM public.audit_logs
    WHERE event_type IN ('admin_profile_access', 'admin_profile_update', 'admin_profile_view', 'sensitive_profile_data_changed')
      AND created_at > NOW() - INTERVAL '1 hour'
      AND user_id IS NOT NULL
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
$function$;

-- Simplify and consolidate RLS policies
-- Remove redundant policies on products table
DROP POLICY IF EXISTS "Products can be created by wholesalers" ON products;
DROP POLICY IF EXISTS "Products can be updated by their shop owner" ON products;
DROP POLICY IF EXISTS "Products can be deleted by their shop owner" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;

-- Create simplified, consolidated policies for products
CREATE POLICY "products_select_public" ON products
FOR SELECT TO public
USING (is_active = true AND verification_status = 'approved');

CREATE POLICY "products_manage_own" ON products
FOR ALL TO authenticated
USING (
  shop_id IN (
    SELECT id FROM shops WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  shop_id IN (
    SELECT id FROM shops WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "products_admin_all" ON products
FOR ALL TO authenticated
USING (get_user_role() = 'admin')
WITH CHECK (get_user_role() = 'admin');

-- Restrict profiles_public view to expose minimal data
DROP VIEW IF EXISTS public.profiles_public CASCADE;
CREATE VIEW public.profiles_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  business_name,
  city,
  role,
  verification_status,
  created_at
FROM public.profiles
WHERE verification_status = 'verified';

-- Add RLS to the view's base table is already enabled
-- View will respect the underlying table's RLS policies

-- Create indexes for better RLS performance
CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_active_verified ON products(is_active, verification_status) 
WHERE is_active = true AND verification_status = 'approved';
CREATE INDEX IF NOT EXISTS idx_profiles_verification ON profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_created ON audit_logs(event_type, created_at DESC);

-- Add function for rate limiting profile queries
CREATE OR REPLACE FUNCTION public.check_profile_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  request_count integer;
BEGIN
  -- Count requests in the last minute
  SELECT COUNT(*) INTO request_count
  FROM audit_logs
  WHERE user_id = auth.uid()
    AND event_type IN ('profile_view', 'profile_query')
    AND created_at > NOW() - INTERVAL '1 minute';
  
  -- Allow max 30 profile queries per minute
  IF request_count >= 30 THEN
    INSERT INTO audit_logs (user_id, event_type, table_name, new_values)
    VALUES (
      auth.uid(),
      'rate_limit_exceeded',
      'profiles',
      jsonb_build_object('limit_type', 'profile_query', 'requests', request_count)
    );
    RETURN false;
  END IF;
  
  -- Log the query
  INSERT INTO audit_logs (user_id, event_type, table_name)
  VALUES (auth.uid(), 'profile_query', 'profiles');
  
  RETURN true;
END;
$function$;