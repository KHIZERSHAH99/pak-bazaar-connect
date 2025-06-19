import { supabase } from '@/integrations/supabase/client';

// Enhanced audit logging with database persistence and fallback
export const logAuditEvent = async (
  eventType: string,
  tableName?: string,
  recordId?: string,
  oldValues?: any,
  newValues?: any
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get additional context
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
    
    const auditData = {
      user_id: user?.id || null,
      event_type: eventType,
      table_name: tableName || null,
      record_id: recordId || null,
      old_values: oldValues ? JSON.stringify(oldValues) : null,
      new_values: newValues ? JSON.stringify(newValues) : null,
      user_agent: userAgent
    };

    // Always log to console for immediate visibility
    console.log(`🔒 Audit Event: ${eventType}`, {
      user_id: user?.id,
      table: tableName,
      record: recordId,
      timestamp: new Date().toISOString()
    });

    // Try to store in database using raw SQL to bypass type issues
    try {
      const { error } = await supabase.rpc('log_audit_event', {
        p_user_id: user?.id || null,
        p_event_type: eventType,
        p_table_name: tableName || null,
        p_record_id: recordId || null,
        p_old_values: oldValues ? JSON.stringify(oldValues) : null,
        p_new_values: newValues ? JSON.stringify(newValues) : null,
        p_user_agent: userAgent
      });

      if (error) {
        console.warn('Database audit logging failed, using fallback:', error);
        throw error;
      }
    } catch (dbError) {
      // Fallback to localStorage for critical events
      if (typeof window !== 'undefined') {
        const auditLogs = JSON.parse(localStorage.getItem('audit_logs_backup') || '[]');
        auditLogs.push({ ...auditData, timestamp: new Date().toISOString() });
        // Keep only last 50 entries
        if (auditLogs.length > 50) {
          auditLogs.splice(0, auditLogs.length - 50);
        }
        localStorage.setItem('audit_logs_backup', JSON.stringify(auditLogs));
      }
    }

  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
};

// Specific audit event loggers
export const logOrderCreated = async (orderId: string, orderData: any) => {
  await logAuditEvent('order_created', 'orders', orderId, null, orderData);
};

export const logOrderConfirmed = async (orderId: string, wholesalerId: string) => {
  await logAuditEvent('order_confirmed', 'orders', orderId, { status: 'pending' }, { status: 'confirmed', confirmed_by: wholesalerId });
};

export const logOrderRejected = async (orderId: string, wholesalerId: string, reason?: string) => {
  await logAuditEvent('order_rejected', 'orders', orderId, { status: 'pending' }, { status: 'rejected', rejected_by: wholesalerId, reason });
};

export const logPaymentScreenshotUploaded = async (orderId: string, filePath: string) => {
  await logAuditEvent('payment_screenshot_uploaded', 'orders', orderId, null, { screenshot_path: filePath });
};

export const logCommissionCreated = async (commissionId: string, commissionData: any) => {
  await logAuditEvent('commission_created', 'commission_records', commissionId, null, commissionData);
};

export const logUserSuspended = async (userId: string, reason: string) => {
  await logAuditEvent('user_suspended', 'profiles', userId, { is_suspended: false }, { is_suspended: true, reason });
};

export const logUserUnsuspended = async (userId: string) => {
  await logAuditEvent('user_unsuspended', 'profiles', userId, { is_suspended: true }, { is_suspended: false });
};

export const logSecurityViolation = async (violationType: string, details: any) => {
  await logAuditEvent('security_violation', null, null, null, { violation_type: violationType, details });
};
