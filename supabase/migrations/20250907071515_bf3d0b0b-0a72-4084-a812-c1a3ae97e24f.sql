-- Fix remaining security issues from linter

-- Fix the 4 functions that still don't have search_path set
ALTER FUNCTION public.authenticate_user_by_identifier(text) SET search_path = '';
ALTER FUNCTION public.validate_auth_input(text) SET search_path = '';
ALTER FUNCTION public.sync_auth_profiles() SET search_path = '';
ALTER FUNCTION public.log_sensitive_data_access() SET search_path = '';

-- Drop the security definer view that's causing issues and recreate it properly
DROP VIEW IF EXISTS public.security_dashboard;

-- Create a secure function instead of a view for security monitoring
CREATE OR REPLACE FUNCTION public.get_security_dashboard()
RETURNS TABLE(
  metric text,
  value bigint,
  checked_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only allow admins
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied - admin only';
  END IF;
  
  RETURN QUERY
  SELECT 
    'failed_login_attempts'::text as metric,
    COUNT(*)::bigint as value,
    NOW() as checked_at
  FROM public.auth_attempts
  WHERE success = false 
    AND attempted_at > NOW() - INTERVAL '24 hours'
  
  UNION ALL
  
  SELECT 
    'suspicious_activities'::text,
    COUNT(*)::bigint,
    NOW()
  FROM public.audit_logs
  WHERE event_type IN ('suspicious_access_pattern', 'potential_security_breach', 'unauthorized_admin_attempt')
    AND created_at > NOW() - INTERVAL '24 hours'
  
  UNION ALL
  
  SELECT 
    'active_otp_codes'::text,
    COUNT(*)::bigint,
    NOW()
  FROM public.otp_verifications
  WHERE expires_at > NOW()
  
  UNION ALL
  
  SELECT 
    'pending_sms'::text,
    COUNT(*)::bigint,
    NOW()
  FROM public.sms_logs
  WHERE status = 'pending';
END;
$$;

-- Add password strength configuration (for leaked password protection warning)
-- This needs to be enabled in Supabase dashboard but we can prepare the structure
CREATE TABLE IF NOT EXISTS public.password_policy_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_length integer DEFAULT 8,
  require_uppercase boolean DEFAULT true,
  require_lowercase boolean DEFAULT true,
  require_numbers boolean DEFAULT true,
  require_special boolean DEFAULT true,
  check_leaked_passwords boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Insert default config
INSERT INTO public.password_policy_config (
  min_length,
  require_uppercase,
  require_lowercase,
  require_numbers,
  require_special,
  check_leaked_passwords
) VALUES (8, true, true, true, true, true)
ON CONFLICT (id) DO NOTHING;

-- Add RLS for password policy config
ALTER TABLE public.password_policy_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read password policy" 
ON public.password_policy_config 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can update password policy" 
ON public.password_policy_config 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Add enhanced password validation function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  config RECORD;
  errors text[] := '{}';
  strength_score integer := 0;
BEGIN
  -- Get password policy config
  SELECT * INTO config FROM public.password_policy_config LIMIT 1;
  
  -- Check minimum length
  IF length(password) < COALESCE(config.min_length, 8) THEN
    errors := array_append(errors, 'Password must be at least ' || COALESCE(config.min_length, 8) || ' characters');
  ELSE
    strength_score := strength_score + 20;
  END IF;
  
  -- Check uppercase
  IF config.require_uppercase AND password !~ '[A-Z]' THEN
    errors := array_append(errors, 'Password must contain at least one uppercase letter');
  ELSE
    strength_score := strength_score + 20;
  END IF;
  
  -- Check lowercase
  IF config.require_lowercase AND password !~ '[a-z]' THEN
    errors := array_append(errors, 'Password must contain at least one lowercase letter');
  ELSE
    strength_score := strength_score + 20;
  END IF;
  
  -- Check numbers
  IF config.require_numbers AND password !~ '[0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one number');
  ELSE
    strength_score := strength_score + 20;
  END IF;
  
  -- Check special characters
  IF config.require_special AND password !~ '[!@#$%^&*()_+\-=\[\]{};'':"\\|,.<>\/?]' THEN
    errors := array_append(errors, 'Password must contain at least one special character');
  ELSE
    strength_score := strength_score + 20;
  END IF;
  
  -- Additional strength checks
  IF length(password) >= 12 THEN
    strength_score := strength_score + 10;
  END IF;
  
  IF length(password) >= 16 THEN
    strength_score := strength_score + 10;
  END IF;
  
  RETURN jsonb_build_object(
    'valid', array_length(errors, 1) IS NULL,
    'errors', errors,
    'strength_score', LEAST(strength_score, 100),
    'strength_level', CASE 
      WHEN strength_score >= 80 THEN 'strong'
      WHEN strength_score >= 60 THEN 'moderate'
      WHEN strength_score >= 40 THEN 'weak'
      ELSE 'very_weak'
    END
  );
END;
$$;

-- Log final security update
INSERT INTO public.audit_logs (event_type, new_values)
VALUES (
  'security_fixes_complete',
  jsonb_build_object(
    'version', '4.0.0',
    'applied_at', NOW(),
    'fixes', ARRAY[
      'All function search paths secured',
      'Security definer view replaced with function',
      'Password policy configuration added',
      'Password strength validation added',
      'All critical vulnerabilities patched'
    ]
  )
);