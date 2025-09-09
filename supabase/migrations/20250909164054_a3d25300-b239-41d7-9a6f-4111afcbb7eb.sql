-- Drop existing policies if they exist
DROP POLICY IF EXISTS "audit_system_insert" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_secure_access" ON public.audit_logs;

-- Ensure the table has all required columns
ALTER TABLE public.audit_logs 
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS event_type TEXT,
  ADD COLUMN IF NOT EXISTS table_name TEXT,
  ADD COLUMN IF NOT EXISTS record_id UUID,
  ADD COLUMN IF NOT EXISTS old_values JSONB,
  ADD COLUMN IF NOT EXISTS new_values JSONB,
  ADD COLUMN IF NOT EXISTS ip_address INET,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Recreate policies
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

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);