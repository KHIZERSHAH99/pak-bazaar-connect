
import { supabase } from '@/integrations/supabase/client';

// Enhanced audit logging with detailed security tracking
export const logSecurityEvent = async (event: string, details: any = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Enhanced event data
    const eventData = {
      user_id: user?.id || null,
      action: event,
      table_name: 'security_events',
      record_id: null,
      old_values: null,
      new_values: {
        event_type: event,
        timestamp: new Date().toISOString(),
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        ip_address: null, // Will be populated by edge function if needed
        details: details
      }
    };

    // Log to audit_logs table if it exists
    const { error } = await supabase
      .from('audit_logs')
      .insert([eventData]);

    if (error) {
      console.warn('Failed to log to audit_logs table:', error);
    }

    // Always log to console for immediate visibility
    console.log(`🔒 Security Event: ${event}`, {
      user_id: user?.id,
      timestamp: new Date().toISOString(),
      details
    });

  } catch (error) {
    console.error('Failed to log security event:', error);
    // Don't throw error to avoid breaking the main flow
  }
};

// Specific security event loggers
export const logLoginAttempt = async (email: string, success: boolean, error?: string) => {
  await logSecurityEvent(success ? 'login_success' : 'login_failure', {
    email: email.toLowerCase(),
    success,
    error_message: error
  });
};

export const logDataAccess = async (table: string, operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE', recordId?: string) => {
  await logSecurityEvent('data_access', {
    table_name: table,
    operation,
    record_id: recordId
  });
};

export const logRoleChange = async (fromRole: string, toRole: string, approved: boolean = false) => {
  await logSecurityEvent('role_change', {
    from_role: fromRole,
    to_role: toRole,
    approved,
    requires_approval: !approved
  });
};

export const logSensitiveDataAccess = async (dataType: 'ntn' | 'strn' | 'phone' | 'business_data', context: string) => {
  await logSecurityEvent('sensitive_data_access', {
    data_type: dataType,
    access_context: context
  });
};

export const logSecurityViolation = async (violationType: string, details: any) => {
  await logSecurityEvent('security_violation', {
    violation_type: violationType,
    severity: 'high',
    ...details
  });
};
