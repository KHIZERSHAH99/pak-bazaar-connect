-- SECURITY FIX MIGRATION v3 - Fixed Index Issue
-- Phase 1: Clean up existing policies

-- OTP Verifications
DROP POLICY IF EXISTS "Users can view own OTP records only" ON public.otp_verifications;
DROP POLICY IF EXISTS "Users can view their own OTP records" ON public.otp_verifications;
DROP POLICY IF EXISTS "System can insert OTP records" ON public.otp_verifications;
DROP POLICY IF EXISTS "System can update OTP records" ON public.otp_verifications;
DROP POLICY IF EXISTS "auth_users_view_own_otp" ON public.otp_verifications;
DROP POLICY IF EXISTS "system_insert_otp" ON public.otp_verifications;
DROP POLICY IF EXISTS "system_update_otp" ON public.otp_verifications;

-- SMS Logs
DROP POLICY IF EXISTS "Admins can view all SMS logs" ON public.sms_logs;
DROP POLICY IF EXISTS "Only admins can view SMS logs" ON public.sms_logs;
DROP POLICY IF EXISTS "System can insert SMS logs" ON public.sms_logs;
DROP POLICY IF EXISTS "admin_only_sms_logs" ON public.sms_logs;
DROP POLICY IF EXISTS "system_insert_sms" ON public.sms_logs;

-- Auth Attempts
DROP POLICY IF EXISTS "Only admins can view auth attempts" ON public.auth_attempts;
DROP POLICY IF EXISTS "Strict admin only auth attempts" ON public.auth_attempts;
DROP POLICY IF EXISTS "admin_only_auth_attempts" ON public.auth_attempts;

-- Audit Logs
DROP POLICY IF EXISTS "Users can view their own audit logs only" ON public.audit_logs;
DROP POLICY IF EXISTS "Secure audit log access" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "secure_audit_access" ON public.audit_logs;
DROP POLICY IF EXISTS "system_audit_insert" ON public.audit_logs;

-- Password Security Events
DROP POLICY IF EXISTS "Admins can view all password events" ON public.password_security_events;
DROP POLICY IF EXISTS "Users can view their own password events" ON public.password_security_events;
DROP POLICY IF EXISTS "users_own_password_events" ON public.password_security_events;
DROP POLICY IF EXISTS "admin_all_password_events" ON public.password_security_events;

-- Phase 2: Create secure policies

-- OTP Verifications - Restrict to authenticated users only
CREATE POLICY "otp_own_records_only" 
ON public.otp_verifications 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "otp_system_insert" 
ON public.otp_verifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "otp_system_update" 
ON public.otp_verifications 
FOR UPDATE 
USING (true);

-- SMS Logs - Admin only
CREATE POLICY "sms_admin_only" 
ON public.sms_logs 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "sms_system_insert" 
ON public.sms_logs 
FOR INSERT 
WITH CHECK (true);

-- Auth Attempts - Admin only
CREATE POLICY "auth_attempts_admin_only" 
ON public.auth_attempts 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Audit Logs - Users see own, admins see all
CREATE POLICY "audit_secure_access" 
ON public.audit_logs 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  (
    (auth.uid() = user_id) 
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

CREATE POLICY "audit_system_insert" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Password Security Events
CREATE POLICY "password_events_own" 
ON public.password_security_events
FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "password_events_admin" 
ON public.password_security_events
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Phase 3: Create cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  deleted_otps integer;
  deleted_sms integer;
  deleted_attempts integer;
  deleted_logs integer;
BEGIN
  -- Delete expired OTP records
  DELETE FROM public.otp_verifications 
  WHERE expires_at < NOW() - INTERVAL '24 hours';
  GET DIAGNOSTICS deleted_otps = ROW_COUNT;
  
  -- Delete old SMS logs
  DELETE FROM public.sms_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_sms = ROW_COUNT;
  
  -- Delete old auth attempts
  DELETE FROM public.auth_attempts 
  WHERE attempted_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS deleted_attempts = ROW_COUNT;
  
  -- Delete old non-critical audit logs
  DELETE FROM public.audit_logs 
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND event_type NOT IN (
      'admin_role_granted',
      'unauthorized_admin_attempt', 
      'suspicious_access_pattern',
      'security_update_applied',
      'critical_security_update'
    );
  GET DIAGNOSTICS deleted_logs = ROW_COUNT;
    
  -- Log cleanup if anything was deleted
  IF deleted_otps > 0 OR deleted_sms > 0 OR deleted_attempts > 0 OR deleted_logs > 0 THEN
    INSERT INTO public.audit_logs (event_type, new_values)
    VALUES (
      'data_cleanup',
      jsonb_build_object(
        'deleted_otps', deleted_otps,
        'deleted_sms', deleted_sms,
        'deleted_auth_attempts', deleted_attempts,
        'deleted_audit_logs', deleted_logs,
        'cleaned_at', NOW()
      )
    );
  END IF;
END;
$$;

-- Phase 4: Add simple indexes (no partial indexes with functions)
CREATE INDEX IF NOT EXISTS idx_otp_expires_at 
ON public.otp_verifications(expires_at);

CREATE INDEX IF NOT EXISTS idx_sms_logs_created 
ON public.sms_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_auth_attempts_time 
ON public.auth_attempts(attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created 
ON public.audit_logs(created_at DESC);

-- Phase 5: Create security monitoring function
CREATE OR REPLACE FUNCTION public.get_security_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  stats jsonb;
BEGIN
  -- Only allow admins to access
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT jsonb_build_object(
    'failed_logins_24h', (
      SELECT COUNT(*) FROM public.auth_attempts
      WHERE success = false AND attempted_at > NOW() - INTERVAL '24 hours'
    ),
    'active_otps', (
      SELECT COUNT(*) FROM public.otp_verifications
      WHERE expires_at > NOW()
    ),
    'pending_sms', (
      SELECT COUNT(*) FROM public.sms_logs
      WHERE status = 'pending'
    ),
    'recent_suspicious', (
      SELECT COUNT(*) FROM public.audit_logs
      WHERE event_type IN ('suspicious_access_pattern', 'unauthorized_admin_attempt')
      AND created_at > NOW() - INTERVAL '24 hours'
    ),
    'checked_at', NOW()
  ) INTO stats;
  
  RETURN stats;
END;
$$;

-- Log the security update
INSERT INTO public.audit_logs (event_type, new_values)
VALUES (
  'security_policies_updated',
  jsonb_build_object(
    'version', '3.0.0',
    'applied_at', NOW(),
    'changes', ARRAY[
      'Fixed RLS policies for sensitive tables',
      'Added data retention cleanup function',
      'Created security monitoring function',
      'Added performance indexes',
      'Removed public access to sensitive data'
    ]
  )
);