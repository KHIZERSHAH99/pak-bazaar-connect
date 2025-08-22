-- Create the missing function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
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

-- Create comprehensive security monitoring tables
CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_attempts_identifier ON public.auth_attempts(identifier);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_attempted_at ON public.auth_attempts(attempted_at);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_success ON public.auth_attempts(success);

-- Enable RLS on auth_attempts
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy for auth attempts
DROP POLICY IF EXISTS "Only admins can view auth attempts" ON public.auth_attempts;
CREATE POLICY "Only admins can view auth attempts" ON public.auth_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create password security events table
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

-- Create policies for password security events
DROP POLICY IF EXISTS "Users can view their own password events" ON public.password_security_events;
DROP POLICY IF EXISTS "Admins can view all password events" ON public.password_security_events;

CREATE POLICY "Users can view their own password events" ON public.password_security_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all password events" ON public.password_security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create security functions
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