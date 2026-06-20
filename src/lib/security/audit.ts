import { supabase } from '@/integrations/supabase/client';

// Enhanced audit logging with detailed security tracking
export const logSecurityEvent = async (event: string, details: any = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Use secure SECURITY DEFINER function to insert audit logs
    // This bypasses RLS safely while preventing direct table manipulation
    const { error } = await supabase.rpc('secure_insert_audit_log', {
      p_user_id: user?.id || null,
      p_event_type: event,
      p_table_name: details.table_name || null,
      p_record_id: details.record_id || null,
      p_old_values: details.old_values || null,
      p_new_values: details,
      p_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
    });

    if (error) {
      // Fallback to console logging if secure function fails
      console.warn('Audit log insert failed, falling back to console:', error);
    }

    // Always log to console for immediate visibility
    console.log(`🔒 Security Event: ${event}`, {
      user_id: user?.id,
      timestamp: new Date().toISOString(),
      details
    });

    // Store in localStorage as backup (development only — avoid persisting
    // sensitive event details like emails in production browsers)
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      const securityLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      securityLogs.push({
        user_id: user?.id || null,
        event_type: event,
        timestamp: new Date().toISOString(),
        details
      });
      // Keep only last 100 entries
      if (securityLogs.length > 100) {
        securityLogs.splice(0, securityLogs.length - 100);
      }
      localStorage.setItem('security_logs', JSON.stringify(securityLogs));
    }

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
