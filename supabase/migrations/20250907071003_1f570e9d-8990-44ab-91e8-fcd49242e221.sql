-- COMPREHENSIVE SECURITY FIX MIGRATION
-- Drop all existing policies first to avoid conflicts

-- 1. OTP Verifications - Drop all existing policies
DROP POLICY IF EXISTS "Users can view own OTP records only" ON public.otp_verifications;
DROP POLICY IF EXISTS "Users can view their own OTP records" ON public.otp_verifications;
DROP POLICY IF EXISTS "System can insert OTP records" ON public.otp_verifications;
DROP POLICY IF EXISTS "System can update OTP records" ON public.otp_verifications;

-- Create secure policies for OTP
CREATE POLICY "auth_users_view_own_otp" 
ON public.otp_verifications 
FOR SELECT 
USING (auth.uid() = user_id AND user_id IS NOT NULL);

CREATE POLICY "system_insert_otp" 
ON public.otp_verifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "system_update_otp" 
ON public.otp_verifications 
FOR UPDATE 
USING (true);

-- 2. SMS Logs - Drop and recreate with admin-only access
DROP POLICY IF EXISTS "Admins can view all SMS logs" ON public.sms_logs;
DROP POLICY IF EXISTS "Only admins can view SMS logs" ON public.sms_logs;
DROP POLICY IF EXISTS "System can insert SMS logs" ON public.sms_logs;

CREATE POLICY "admin_only_sms_logs" 
ON public.sms_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "system_insert_sms" 
ON public.sms_logs 
FOR INSERT 
WITH CHECK (true);

-- 3. Auth Attempts - Strict admin only
DROP POLICY IF EXISTS "Only admins can view auth attempts" ON public.auth_attempts;
DROP POLICY IF EXISTS "Strict admin only auth attempts" ON public.auth_attempts;

CREATE POLICY "admin_only_auth_attempts" 
ON public.auth_attempts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- 4. Audit Logs - Secure access
DROP POLICY IF EXISTS "Users can view their own audit logs only" ON public.audit_logs;
DROP POLICY IF EXISTS "Secure audit log access" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

CREATE POLICY "secure_audit_access" 
ON public.audit_logs 
FOR SELECT 
USING (
  (auth.uid() = user_id AND user_id IS NOT NULL) 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "system_audit_insert" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- 5. Password Security Events - Ensure proper policies
DROP POLICY IF EXISTS "Admins can view all password events" ON public.password_security_events;
DROP POLICY IF EXISTS "Users can view their own password events" ON public.password_security_events;

CREATE POLICY "users_own_password_events" 
ON public.password_security_events
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "admin_all_password_events" 
ON public.password_security_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Add secure cleanup functions with proper error handling
CREATE OR REPLACE FUNCTION public.secure_cleanup_old_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Cleanup OTP records
  DELETE FROM public.otp_verifications 
  WHERE expires_at < NOW() - INTERVAL '24 hours';
  
  -- Cleanup old SMS logs (keep 30 days)
  DELETE FROM public.sms_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Cleanup old auth attempts (keep 7 days)
  DELETE FROM public.auth_attempts 
  WHERE attempted_at < NOW() - INTERVAL '7 days';
  
  -- Cleanup non-critical audit logs (keep 90 days)
  DELETE FROM public.audit_logs 
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND event_type NOT IN (
      'admin_role_granted',
      'unauthorized_admin_attempt',
      'suspicious_access_pattern',
      'potential_security_breach',
      'data_breach_attempt',
      'security_update_applied'
    );
    
  -- Log cleanup activity
  INSERT INTO public.audit_logs (event_type, new_values)
  VALUES (
    'data_cleanup_executed',
    jsonb_build_object(
      'cleaned_at', NOW(),
      'tables_cleaned', ARRAY['otp_verifications', 'sms_logs', 'auth_attempts', 'audit_logs']
    )
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail
    INSERT INTO public.audit_logs (event_type, new_values)
    VALUES (
      'cleanup_error',
      jsonb_build_object('error', SQLERRM, 'at', NOW())
    );
END;
$$;

-- Create enhanced security monitoring function
CREATE OR REPLACE FUNCTION public.get_security_metrics()
RETURNS TABLE(
  metric_name text,
  metric_value bigint,
  severity text,
  checked_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  WITH security_metrics AS (
    SELECT 
      'failed_logins_24h'::text as name,
      COUNT(*)::bigint as value,
      CASE 
        WHEN COUNT(*) > 100 THEN 'critical'
        WHEN COUNT(*) > 50 THEN 'high'
        WHEN COUNT(*) > 20 THEN 'medium'
        ELSE 'low'
      END as severity
    FROM public.auth_attempts
    WHERE success = false 
      AND attempted_at > NOW() - INTERVAL '24 hours'
    
    UNION ALL
    
    SELECT 
      'suspicious_activities_24h'::text,
      COUNT(*)::bigint,
      CASE 
        WHEN COUNT(*) > 10 THEN 'critical'
        WHEN COUNT(*) > 5 THEN 'high'
        ELSE 'medium'
      END
    FROM public.audit_logs
    WHERE event_type IN (
      'suspicious_access_pattern',
      'potential_security_breach',
      'unauthorized_admin_attempt'
    )
    AND created_at > NOW() - INTERVAL '24 hours'
    
    UNION ALL
    
    SELECT 
      'active_otp_codes'::text,
      COUNT(*)::bigint,
      CASE 
        WHEN COUNT(*) > 50 THEN 'high'
        WHEN COUNT(*) > 20 THEN 'medium'
        ELSE 'low'
      END
    FROM public.otp_verifications
    WHERE expires_at > NOW()
    
    UNION ALL
    
    SELECT 
      'pending_sms_messages'::text,
      COUNT(*)::bigint,
      CASE 
        WHEN COUNT(*) > 100 THEN 'high'
        ELSE 'low'
      END
    FROM public.sms_logs
    WHERE status = 'pending'
  )
  SELECT 
    name,
    value,
    severity,
    NOW()
  FROM security_metrics;
END;
$$;

-- Add performance indexes if not exists
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_created 
ON public.audit_logs(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_auth_attempts_success_time 
ON public.auth_attempts(success, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_otp_expires 
ON public.otp_verifications(expires_at)
WHERE expires_at > NOW();

CREATE INDEX IF NOT EXISTS idx_sms_status 
ON public.sms_logs(status, created_at DESC);

-- Log successful security update
INSERT INTO public.audit_logs (event_type, new_values)
VALUES (
  'critical_security_update',
  jsonb_build_object(
    'version', '2.0.0',
    'applied_at', NOW(),
    'fixes_applied', ARRAY[
      'RLS policies strengthened',
      'Admin-only access to sensitive logs',
      'Data retention policies added',
      'Security monitoring enhanced',
      'Performance indexes added'
    ]
  )
);