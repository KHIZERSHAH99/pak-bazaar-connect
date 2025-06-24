
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
      p_user_agent: userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : null)
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

// Order-specific audit logging functions
export const logOrderCreated = async (orderId: string, orderDetails: any) => {
  try {
    await logAuditEvent('order_created', 'orders', orderId, null, {
      order_details: orderDetails,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log order creation:', error);
  }
};

export const logOrderConfirmed = async (orderId: string, userId: string) => {
  try {
    await logAuditEvent('order_confirmed', 'orders', orderId, null, {
      confirmed_by: userId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log order confirmation:', error);
  }
};

export const logOrderRejected = async (orderId: string, userId: string, reason?: string) => {
  try {
    await logAuditEvent('order_rejected', 'orders', orderId, null, {
      rejected_by: userId,
      reason: reason || 'No reason provided',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log order rejection:', error);
  }
};

export const logPaymentScreenshotUploaded = async (orderId: string, filePath: string) => {
  try {
    await logAuditEvent('payment_screenshot_uploaded', 'orders', orderId, null, {
      file_path: filePath,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log payment screenshot upload:', error);
  }
};

// Additional security monitoring functions
export const logRoleChangeRequest = async (userId: string, fromRole: string, toRole: string) => {
  try {
    await logAuditEvent('role_change_requested', 'profiles', userId, { role: fromRole }, { role: toRole });
  } catch (error) {
    console.error('Failed to log role change request:', error);
  }
};

export const logSuspiciousActivity = async (activityType: string, details: any) => {
  try {
    await logAuditEvent('suspicious_activity', null, null, null, {
      activity_type: activityType,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log suspicious activity:', error);
  }
};
