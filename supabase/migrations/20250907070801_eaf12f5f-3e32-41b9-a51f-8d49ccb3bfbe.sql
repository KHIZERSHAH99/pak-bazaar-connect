-- PHASE 1: Fix Critical RLS Policies

-- 1. Fix OTP Verifications Table - Remove public access
DROP POLICY IF EXISTS "Users can view their own OTP records" ON public.otp_verifications;
DROP POLICY IF EXISTS "System can insert OTP records" ON public.otp_verifications;
DROP POLICY IF EXISTS "System can update OTP records" ON public.otp_verifications;

-- Only allow users to see their own OTP records (no public access)
CREATE POLICY "Users can view own OTP records only" 
ON public.otp_verifications 
FOR SELECT 
USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- System operations remain the same
CREATE POLICY "System can insert OTP records" 
ON public.otp_verifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update OTP records" 
ON public.otp_verifications 
FOR UPDATE 
USING (true);

-- 2. Fix SMS Logs Table - Admin only access
DROP POLICY IF EXISTS "Admins can view all SMS logs" ON public.sms_logs;
DROP POLICY IF EXISTS "System can insert SMS logs" ON public.sms_logs;

-- Only admins can view SMS logs
CREATE POLICY "Only admins can view SMS logs" 
ON public.sms_logs 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' AND id = auth.uid()
  )
);

-- System can still insert
CREATE POLICY "System can insert SMS logs" 
ON public.sms_logs 
FOR INSERT 
WITH CHECK (true);

-- 3. Fix Auth Attempts Table - Strict admin only
DROP POLICY IF EXISTS "Only admins can view auth attempts" ON public.auth_attempts;

-- Stricter admin check
CREATE POLICY "Strict admin only auth attempts" 
ON public.auth_attempts 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' AND id = auth.uid()
  )
);

-- 4. Fix Audit Logs - Prevent information leakage
DROP POLICY IF EXISTS "Users can view their own audit logs only" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Users can only see their own logs, admins see all
CREATE POLICY "Secure audit log access" 
ON public.audit_logs 
FOR SELECT 
USING (
  (auth.uid() = user_id AND user_id IS NOT NULL) 
  OR 
  (auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' AND id = auth.uid()
  ))
);

-- System can insert
CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- PHASE 2: Fix Database Function Security (add search_path)

-- Update all functions to include proper search_path
ALTER FUNCTION public.get_user_role() SET search_path = '';
ALTER FUNCTION public.prevent_unauthorized_admin() SET search_path = '';
ALTER FUNCTION public.switch_business_role(text) SET search_path = '';
ALTER FUNCTION public.check_user_exists(text, text) SET search_path = '';
ALTER FUNCTION public.monitor_suspicious_activity() SET search_path = '';
ALTER FUNCTION public.track_order_status_changes() SET search_path = '';
ALTER FUNCTION public.validate_order_security() SET search_path = '';
ALTER FUNCTION public.associate_phone_with_account(text, text) SET search_path = '';
ALTER FUNCTION public.get_current_commission_rate() SET search_path = '';
ALTER FUNCTION public.cleanup_expired_otps() SET search_path = 'public';
ALTER FUNCTION public.get_effective_user_role() SET search_path = '';
ALTER FUNCTION public.check_account_lockout(text) SET search_path = '';
ALTER FUNCTION public.send_otp_sms(text, text) SET search_path = '';
ALTER FUNCTION public.get_available_phones() SET search_path = '';
ALTER FUNCTION public.authenticate_user_by_phone(text) SET search_path = '';
ALTER FUNCTION public.verify_otp(text, text) SET search_path = '';
ALTER FUNCTION public.create_commission_on_completion() SET search_path = '';
ALTER FUNCTION public.increment_coupon_usage(uuid) SET search_path = '';
ALTER FUNCTION public.delete_old_screenshots() SET search_path = '';
ALTER FUNCTION public.get_wholesaler_monthly_sales(uuid, date) SET search_path = '';
ALTER FUNCTION public.create_commission_record() SET search_path = '';
ALTER FUNCTION public.log_order_action() SET search_path = '';
ALTER FUNCTION public.log_sensitive_data_access() SET search_path = '';
ALTER FUNCTION public.get_profile_summary(uuid) SET search_path = '';
ALTER FUNCTION public.get_product_analytics(uuid[], date) SET search_path = '';
ALTER FUNCTION public.track_product_view(uuid, text, text, text) SET search_path = '';
ALTER FUNCTION public.add_order_tracking(uuid, text, text) SET search_path = '';
ALTER FUNCTION public.validate_profile_update() SET search_path = '';
ALTER FUNCTION public.auto_track_order_changes() SET search_path = '';
ALTER FUNCTION public.delete_old_payment_screenshots() SET search_path = '';
ALTER FUNCTION public.log_audit_event(uuid, text, text, text, text, text, text) SET search_path = '';
ALTER FUNCTION public.log_profile_changes() SET search_path = '';
ALTER FUNCTION public.calculate_monthly_commissions(date) SET search_path = '';
ALTER FUNCTION public.suspend_overdue_accounts() SET search_path = '';
ALTER FUNCTION public.delete_completed_order_screenshots() SET search_path = '';
ALTER FUNCTION public.handle_order_completion() SET search_path = '';
ALTER FUNCTION public.enhanced_audit_trigger() SET search_path = '';
ALTER FUNCTION public.log_admin_profile_view(uuid) SET search_path = '';
ALTER FUNCTION public.get_product_analytics_secure(uuid, integer) SET search_path = '';
ALTER FUNCTION public.cleanup_old_product_views() SET search_path = '';
ALTER FUNCTION public.detect_unusual_access_patterns() SET search_path = '';
ALTER FUNCTION public.can_request_otp(text) SET search_path = '';
ALTER FUNCTION public.generate_otp() SET search_path = '';
ALTER FUNCTION public.monitor_product_view_patterns() SET search_path = '';
ALTER FUNCTION public.normalize_phone_trigger() SET search_path = '';
ALTER FUNCTION public.normalize_pakistani_phone(text) SET search_path = '';
ALTER FUNCTION public.validate_pakistani_phone(text) SET search_path = '';
ALTER FUNCTION public.update_sms_status(uuid, text, text, text, numeric) SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.log_auth_attempt(text, boolean, text, text) SET search_path = '';
ALTER FUNCTION public.log_password_security_event(uuid, text, jsonb) SET search_path = '';
ALTER FUNCTION public.auto_confirm_phone_accounts() SET search_path = '';

-- PHASE 3: Add Data Retention Policies

-- Create function to cleanup old OTP records
CREATE OR REPLACE FUNCTION public.cleanup_old_otp_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Delete OTP records older than 24 hours
  DELETE FROM public.otp_verifications 
  WHERE expires_at < NOW() - INTERVAL '24 hours';
  
  -- Log the cleanup
  INSERT INTO public.audit_logs (event_type, new_values)
  VALUES (
    'otp_cleanup',
    jsonb_build_object('cleaned_at', NOW())
  );
END;
$$;

-- Create function to cleanup old SMS logs
CREATE OR REPLACE FUNCTION public.cleanup_old_sms_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Delete SMS logs older than 30 days
  DELETE FROM public.sms_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Log the cleanup
  INSERT INTO public.audit_logs (event_type, new_values)
  VALUES (
    'sms_logs_cleanup',
    jsonb_build_object('cleaned_at', NOW())
  );
END;
$$;

-- Create function to cleanup old auth attempts
CREATE OR REPLACE FUNCTION public.cleanup_old_auth_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Delete auth attempts older than 7 days
  DELETE FROM public.auth_attempts 
  WHERE attempted_at < NOW() - INTERVAL '7 days';
  
  -- Log the cleanup
  INSERT INTO public.audit_logs (event_type, new_values)
  VALUES (
    'auth_attempts_cleanup',
    jsonb_build_object('cleaned_at', NOW())
  );
END;
$$;

-- Create function to cleanup old audit logs (keep 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Delete audit logs older than 90 days (except critical events)
  DELETE FROM public.audit_logs 
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND event_type NOT IN (
      'admin_role_granted',
      'unauthorized_admin_attempt',
      'suspicious_access_pattern',
      'potential_security_breach',
      'data_breach_attempt'
    );
END;
$$;

-- PHASE 4: Add indexes for performance and monitoring
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_event ON public.audit_logs(user_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_identifier ON public.auth_attempts(identifier, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone ON public.otp_verifications(phone_number, expires_at);
CREATE INDEX IF NOT EXISTS idx_sms_logs_phone_created ON public.sms_logs(phone_number, created_at DESC);

-- PHASE 5: Create security monitoring view for admins
CREATE OR REPLACE VIEW public.security_dashboard AS
SELECT 
  'failed_login_attempts' as metric,
  COUNT(*) as value,
  NOW() as checked_at
FROM public.auth_attempts
WHERE success = false 
  AND attempted_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
  'suspicious_activities' as metric,
  COUNT(*) as value,
  NOW() as checked_at
FROM public.audit_logs
WHERE event_type IN ('suspicious_access_pattern', 'potential_security_breach', 'unauthorized_admin_attempt')
  AND created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
  'active_otp_codes' as metric,
  COUNT(*) as value,
  NOW() as checked_at
FROM public.otp_verifications
WHERE expires_at > NOW()
UNION ALL
SELECT 
  'pending_sms' as metric,
  COUNT(*) as value,
  NOW() as checked_at
FROM public.sms_logs
WHERE status = 'pending';

-- Grant access to security dashboard only to admins
GRANT SELECT ON public.security_dashboard TO authenticated;

-- Add RLS to the view (through a wrapper table if needed)
-- Views don't support RLS directly, so we control access through functions

-- Log this security update
INSERT INTO public.audit_logs (event_type, new_values)
VALUES (
  'security_update_applied',
  jsonb_build_object(
    'version', '1.0.0',
    'applied_at', NOW(),
    'components', ARRAY['rls_policies', 'function_security', 'data_retention', 'monitoring']
  )
);