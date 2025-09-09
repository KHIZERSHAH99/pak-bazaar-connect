-- Ensure audit_logs table exists with proper structure
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  event_type TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- RLS policies for audit logs
CREATE POLICY "audit_system_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "audit_secure_access" ON public.audit_logs
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = user_id OR 
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Recreate the log_audit_event function to ensure it works
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_table_name TEXT DEFAULT NULL,
  p_record_id TEXT DEFAULT NULL,
  p_old_values TEXT DEFAULT NULL,
  p_new_values TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';