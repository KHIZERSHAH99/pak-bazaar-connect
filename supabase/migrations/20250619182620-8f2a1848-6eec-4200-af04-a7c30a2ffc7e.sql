
-- Create the log_audit_event RPC function for secure audit logging
CREATE OR REPLACE FUNCTION log_audit_event(
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
  INSERT INTO audit_logs (
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
    p_record_id::UUID,
    p_old_values::JSONB,
    p_new_values::JSONB,
    p_user_agent
  );
END;
$$;
