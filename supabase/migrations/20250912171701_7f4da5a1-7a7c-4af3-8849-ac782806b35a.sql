-- Fix RLS on new tables
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for rate_limits table
CREATE POLICY "rate_limits_insert" ON public.rate_limits
FOR INSERT WITH CHECK (true); -- Allow system to track all requests

CREATE POLICY "rate_limits_admin_view" ON public.rate_limits
FOR SELECT USING (get_user_role() = 'admin');

-- RLS policies for admin_sessions table
CREATE POLICY "admin_sessions_own" ON public.admin_sessions
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "admin_sessions_admin" ON public.admin_sessions
FOR ALL USING (get_user_role() = 'admin');

-- Fix views to not use SECURITY DEFINER
DROP VIEW IF EXISTS public.profiles_public CASCADE;
DROP VIEW IF EXISTS public.security_metrics CASCADE;

-- Recreate views without SECURITY DEFINER
CREATE VIEW public.profiles_public AS
SELECT 
  id,
  business_name,
  business_type,
  city,
  verification_status,
  created_at,
  role
FROM public.profiles
WHERE is_suspended = false;

CREATE VIEW public.security_metrics AS
SELECT 
  'failed_login_attempts' as metric,
  COUNT(*) as value,
  NOW() as measured_at
FROM public.audit_logs
WHERE event_type = 'login_failed'
  AND created_at > NOW() - INTERVAL '1 hour'
UNION ALL
SELECT 
  'suspicious_activities' as metric,
  COUNT(*) as value,
  NOW() as measured_at
FROM public.audit_logs
WHERE event_type IN ('suspicious_role_switching', 'suspicious_access_pattern', 'unauthorized_admin_attempt')
  AND created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
  'rate_limit_violations' as metric,
  COUNT(*) as value,
  NOW() as measured_at
FROM public.audit_logs
WHERE event_type = 'rate_limit_exceeded'
  AND created_at > NOW() - INTERVAL '1 hour';

-- Add RLS policy for views
CREATE POLICY "profiles_public_view" ON public.profiles 
FOR SELECT USING (true); -- Public can view basic profile info

-- Add IP whitelisting for admin access
CREATE TABLE IF NOT EXISTS public.admin_ip_whitelist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL UNIQUE,
  description text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT NOW()
);

ALTER TABLE public.admin_ip_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_ip_whitelist_admin_only" ON public.admin_ip_whitelist
FOR ALL USING (get_user_role() = 'admin');

-- Insert default admin IP (localhost for development)
INSERT INTO public.admin_ip_whitelist (ip_address, description) 
VALUES ('127.0.0.1', 'Local development')
ON CONFLICT DO NOTHING;

-- Enhanced function to validate admin access with IP checking
CREATE OR REPLACE FUNCTION public.validate_admin_access(p_ip_address inet DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  is_admin boolean;
  ip_allowed boolean;
BEGIN
  -- Check if user is admin
  is_admin := (get_user_role() = 'admin');
  
  IF NOT is_admin THEN
    RETURN false;
  END IF;
  
  -- Check IP whitelist if provided
  IF p_ip_address IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.admin_ip_whitelist
      WHERE ip_address = p_ip_address
        AND is_active = true
    ) INTO ip_allowed;
    
    IF NOT ip_allowed THEN
      -- Log unauthorized IP access attempt
      INSERT INTO public.audit_logs (user_id, event_type, table_name, new_values)
      VALUES (
        auth.uid(),
        'admin_access_denied_ip',
        'admin_ip_whitelist',
        jsonb_build_object(
          'ip_address', p_ip_address::text,
          'user_id', auth.uid()
        )
      );
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$function$;

-- Add CSRF token table
CREATE TABLE IF NOT EXISTS public.csrf_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT NOW()
);

ALTER TABLE public.csrf_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "csrf_tokens_own" ON public.csrf_tokens
FOR ALL USING (user_id = auth.uid());

-- Function to generate CSRF token
CREATE OR REPLACE FUNCTION public.generate_csrf_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_token text;
BEGIN
  -- Generate random token
  new_token := encode(gen_random_bytes(32), 'hex');
  
  -- Store token
  INSERT INTO public.csrf_tokens (user_id, token, expires_at)
  VALUES (auth.uid(), new_token, NOW() + INTERVAL '1 hour');
  
  -- Clean up old tokens
  DELETE FROM public.csrf_tokens
  WHERE user_id = auth.uid()
    AND (expires_at < NOW() OR used = true);
  
  RETURN new_token;
END;
$function$;

-- Function to validate CSRF token
CREATE OR REPLACE FUNCTION public.validate_csrf_token(p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  token_valid boolean;
BEGIN
  -- Check if token exists and is valid
  SELECT EXISTS(
    SELECT 1 FROM public.csrf_tokens
    WHERE token = p_token
      AND user_id = auth.uid()
      AND expires_at > NOW()
      AND used = false
  ) INTO token_valid;
  
  IF token_valid THEN
    -- Mark token as used
    UPDATE public.csrf_tokens
    SET used = true
    WHERE token = p_token;
  END IF;
  
  RETURN token_valid;
END;
$function$;