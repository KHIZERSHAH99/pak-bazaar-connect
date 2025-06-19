
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

// Enhanced audit logging for security monitoring
export const logAuditEvent = async (
  eventType: string,
  tableName?: string | null,
  recordId?: string | null,
  oldValues?: any,
  newValues?: any
) => {
  try {
    const user = await getCurrentUser();
    
    const auditData = {
      user_id: user?.id || null,
      event_type: eventType,
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues ? JSON.stringify(oldValues) : null,
      new_values: newValues ? JSON.stringify(newValues) : null,
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('audit_logs')
      .insert([auditData]);

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (error) {
    console.error('Audit logging error:', error);
  }
};

// Specific audit log functions
export const logOrderCreated = async (orderId: string, orderDetails: any) => {
  await logAuditEvent('order_created', 'orders', orderId, null, orderDetails);
};

export const logOrderConfirmed = async (orderId: string, wholesalerId: string) => {
  await logAuditEvent('order_confirmed', 'orders', orderId, null, { wholesaler_id: wholesalerId });
};

export const logOrderRejected = async (orderId: string, wholesalerId: string, reason?: string) => {
  await logAuditEvent('order_rejected', 'orders', orderId, null, { 
    wholesaler_id: wholesalerId,
    reason 
  });
};

export const logPaymentScreenshotUploaded = async (orderId: string, filePath: string) => {
  await logAuditEvent('payment_screenshot_uploaded', 'orders', orderId, null, { file_path: filePath });
};

export const logRoleChangeRequested = async (userId: string, requestedRole: string) => {
  await logAuditEvent('role_change_requested', 'role_requests', userId, null, { requested_role: requestedRole });
};

export const logLoginAttempt = async (email: string, success: boolean, error?: string) => {
  await logAuditEvent(
    success ? 'login_success' : 'login_failed',
    'profiles',
    null,
    null,
    { email, success, error }
  );
};
