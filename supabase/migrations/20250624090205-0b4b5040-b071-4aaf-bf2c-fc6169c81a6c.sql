
-- Create the missing audit_logs table that's required by the authentication system
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit logs
CREATE POLICY "Users can view their own audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  USING (auth.uid() = user_id OR public.get_user_role() = 'admin');

CREATE POLICY "Admins can view all audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  USING (public.get_user_role() = 'admin');

CREATE POLICY "System can insert audit logs" 
  ON public.audit_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Fix the log_audit_event function to handle the missing table
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_table_name TEXT DEFAULT NULL,
  p_record_id TEXT DEFAULT NULL,
  p_old_values TEXT DEFAULT NULL,
  p_new_values TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    table_name,
    record_id,
    old_values,
    new_values,
    user_agent
  ) VALUES (
    p_user_id,
    p_event_type,
    p_table_name,
    CASE WHEN p_record_id IS NOT NULL THEN p_record_id::UUID ELSE NULL END,
    CASE WHEN p_old_values IS NOT NULL THEN p_old_values::JSONB ELSE NULL END,
    CASE WHEN p_new_values IS NOT NULL THEN p_new_values::JSONB ELSE NULL END,
    p_user_agent
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the operation
    RAISE WARNING 'Failed to log audit event: %', SQLERRM;
END;
$$;

-- Add trigger to profiles table to log role changes
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log role changes
  IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    PERFORM public.log_audit_event(
      NEW.id,
      'role_changed',
      'profiles',
      NEW.id::TEXT,
      jsonb_build_object('role', OLD.role),
      jsonb_build_object('role', NEW.role)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_log_profile_changes ON public.profiles;
CREATE TRIGGER trigger_log_profile_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_changes();
