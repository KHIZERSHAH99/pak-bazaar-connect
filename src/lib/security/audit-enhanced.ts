
import { supabase } from '@/integrations/supabase/client';

export interface AuditEvent {
  user_id?: string;
  event_type: string;
  table_name?: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  user_agent?: string;
}

export const logAuditEvent = async (
  eventType: string,
  tableName?: string,
  recordId?: string,
  oldValues?: any,
  newValues?: any,
  userAgent?: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.rpc('log_audit_event', {
      p_user_id: user?.id || null,
      p_event_type: eventType,
      p_table_name: tableName,
      p_record_id: recordId,
      p_old_values: oldValues ? JSON.stringify(oldValues) : null,
      p_new_values: newValues ? JSON.stringify(newValues) : null,
      p_user_agent: userAgent || navigator.userAgent
    });

    if (error) {
      console.error('Audit logging error:', error);
    }
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
};

export const logSecurityViolation = async (violationType: string, details: any) => {
  try {
    await logAuditEvent('security_violation', null, null, null, {
      violation_type: violationType,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log security violation:', error);
  }
};
