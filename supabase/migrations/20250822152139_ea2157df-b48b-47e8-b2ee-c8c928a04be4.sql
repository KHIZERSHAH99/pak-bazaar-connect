-- Add comprehensive search path security to all database functions
-- This prevents function search path hijacking attacks

-- First, let's create a secure function to set search paths for all functions
CREATE OR REPLACE FUNCTION secure_function_search_path()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set secure search path for all functions
  PERFORM pg_catalog.set_config('search_path', '', false);
END;
$$;

-- Update existing functions with secure search paths
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Secure the audit logging function
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id, 
    event_type, 
    old_values, 
    new_values, 
    created_at
  ) VALUES (
    p_user_id, 
    p_event_type, 
    p_old_values, 
    p_new_values, 
    now()
  );
END;
$$;

-- Add security monitoring for failed authentication attempts
CREATE OR REPLACE FUNCTION log_auth_attempt(
  p_identifier TEXT,
  p_success BOOLEAN,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.auth_attempts (
    identifier,
    success,
    ip_address,
    user_agent,
    attempted_at
  ) VALUES (
    p_identifier,
    p_success,
    p_ip_address,
    p_user_agent,
    now()
  );
  
  -- Log as audit event
  INSERT INTO public.audit_logs (
    user_id, 
    event_type, 
    new_values, 
    created_at
  ) VALUES (
    NULL,
    CASE WHEN p_success THEN 'auth_success' ELSE 'auth_failure' END,
    jsonb_build_object(
      'identifier', p_identifier,
      'ip_address', p_ip_address,
      'user_agent', p_user_agent
    ),
    now()
  );
END;
$$;

-- Create auth attempts table for security monitoring
CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_attempts_identifier ON public.auth_attempts(identifier);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_attempted_at ON public.auth_attempts(attempted_at);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_success ON public.auth_attempts(success);

-- Enable RLS on auth_attempts
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view auth attempts
CREATE POLICY "Only admins can view auth attempts" ON public.auth_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add rate limiting table for enhanced security
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action_type TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for rate limiting
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action ON public.rate_limits(identifier, action_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_end ON public.rate_limits(window_end);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked_until ON public.rate_limits(blocked_until);

-- RLS for rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only system can manage rate limits" ON public.rate_limits
  FOR ALL USING (false);

-- Add password security events table
CREATE TABLE IF NOT EXISTS public.password_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('weak_password', 'breached_password', 'strong_password', 'password_policy_violation')),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for password security events
CREATE INDEX IF NOT EXISTS idx_password_events_user_id ON public.password_security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_password_events_type ON public.password_security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_password_events_created_at ON public.password_security_events(created_at);

-- RLS for password security events
ALTER TABLE public.password_security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own password events" ON public.password_security_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all password events" ON public.password_security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to log password security events
CREATE OR REPLACE FUNCTION log_password_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.password_security_events (
    user_id,
    event_type,
    details,
    created_at
  ) VALUES (
    p_user_id,
    p_event_type,
    p_details,
    now()
  );
END;
$$;

-- Add triggers for updated_at columns
CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON public.rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add constraint to ensure proper event types
ALTER TABLE public.audit_logs 
ADD CONSTRAINT valid_event_types 
CHECK (event_type IN (
  'auth_success', 'auth_failure', 'login_attempt', 'login_success', 'login_failure',
  'password_change', 'profile_update', 'role_change', 'order_created', 'order_updated',
  'product_created', 'product_updated', 'shop_created', 'shop_updated',
  'payment_processed', 'ad_created', 'ad_approved', 'security_violation',
  'rate_limit_exceeded', 'suspicious_activity', 'input_validation_threat_detected',
  'sql_injection_attempt', 'xss_attempt', 'path_traversal_attempt'
));

-- Clean up old audit logs (keep only last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.audit_logs 
  WHERE created_at < now() - INTERVAL '90 days';
  
  DELETE FROM public.auth_attempts 
  WHERE attempted_at < now() - INTERVAL '30 days';
  
  DELETE FROM public.password_security_events 
  WHERE created_at < now() - INTERVAL '90 days';
  
  DELETE FROM public.rate_limits 
  WHERE window_end < now() - INTERVAL '24 hours';
END;
$$;