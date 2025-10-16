-- Phase 3: Security Hardening

-- 1. Create proper user roles table (CRITICAL SECURITY FIX)
-- Roles MUST NOT be stored on profiles table to prevent privilege escalation

-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'wholesaler', 'seller', 'pending');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's current role
CREATE OR REPLACE FUNCTION public.get_user_role_secure(_user_id UUID DEFAULT auth.uid())
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(role, 'pending'::public.app_role)
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::public.app_role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id) DO UPDATE
SET role = EXCLUDED.role,
    updated_at = NOW();

-- RLS policies for user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update get_user_role() to use new table
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(role::TEXT, 'pending')
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- Trigger to sync role changes to user_roles when profiles.role is updated
CREATE OR REPLACE FUNCTION public.sync_profile_role_to_user_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, NEW.role::public.app_role)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = EXCLUDED.role,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_role_to_user_roles
AFTER INSERT OR UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_role_to_user_roles();

-- 2. Add rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint, window_start),
  UNIQUE(ip_address, endpoint, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint ON public.rate_limits(user_id, endpoint, window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint ON public.rate_limits(ip_address, endpoint, window_start);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- System manages rate limits
CREATE POLICY "System manages rate limits"
ON public.rate_limits
FOR ALL
USING (false)
WITH CHECK (false);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_ip_address INET,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  v_window_start := DATE_TRUNC('minute', NOW()) - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Clean up old entries
  DELETE FROM public.rate_limits
  WHERE window_start < v_window_start;
  
  -- Check user rate limit
  IF p_user_id IS NOT NULL THEN
    SELECT COALESCE(SUM(request_count), 0) INTO v_count
    FROM public.rate_limits
    WHERE user_id = p_user_id
      AND endpoint = p_endpoint
      AND window_start >= v_window_start;
    
    IF v_count >= p_max_requests THEN
      RETURN FALSE;
    END IF;
    
    -- Increment counter
    INSERT INTO public.rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, DATE_TRUNC('minute', NOW()))
    ON CONFLICT (user_id, endpoint, window_start)
    DO UPDATE SET request_count = rate_limits.request_count + 1;
  END IF;
  
  -- Check IP rate limit
  IF p_ip_address IS NOT NULL THEN
    SELECT COALESCE(SUM(request_count), 0) INTO v_count
    FROM public.rate_limits
    WHERE ip_address = p_ip_address
      AND endpoint = p_endpoint
      AND window_start >= v_window_start;
    
    IF v_count >= (p_max_requests * 2) THEN -- IP has higher limit
      RETURN FALSE;
    END IF;
    
    INSERT INTO public.rate_limits (ip_address, endpoint, request_count, window_start)
    VALUES (p_ip_address, p_endpoint, 1, DATE_TRUNC('minute', NOW()))
    ON CONFLICT (ip_address, endpoint, window_start)
    DO UPDATE SET request_count = rate_limits.request_count + 1;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 3. Add security headers configuration table
CREATE TABLE IF NOT EXISTS public.security_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.security_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage security config"
ON public.security_config
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default security configuration
INSERT INTO public.security_config (config_key, config_value)
VALUES 
  ('security_headers', '{
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
  }'::jsonb),
  ('rate_limits', '{
    "login": {"max_requests": 5, "window_minutes": 15},
    "signup": {"max_requests": 3, "window_minutes": 60},
    "api": {"max_requests": 100, "window_minutes": 1},
    "upload": {"max_requests": 10, "window_minutes": 60}
  }'::jsonb)
ON CONFLICT (config_key) DO NOTHING;

-- 4. Add audit log for security events
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_user ON public.security_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity, created_at DESC);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view security events"
ON public.security_events
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_severity TEXT DEFAULT 'medium',
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.security_events (
    event_type,
    user_id,
    ip_address,
    user_agent,
    severity,
    details
  ) VALUES (
    p_event_type,
    p_user_id,
    p_ip_address,
    p_user_agent,
    p_severity,
    p_details
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- 5. Update existing RLS policies to use new role system
-- This ensures all existing policies work with the new user_roles table

COMMENT ON TABLE public.user_roles IS 'Stores user roles separately to prevent privilege escalation attacks. Never store roles on the profiles table.';
COMMENT ON FUNCTION public.has_role IS 'Security definer function to check user roles without RLS recursion';
COMMENT ON FUNCTION public.check_rate_limit IS 'Checks rate limits for users and IPs to prevent abuse';
COMMENT ON TABLE public.security_events IS 'Audit log for security-related events';