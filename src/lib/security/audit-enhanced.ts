
import { supabase } from '@/integrations/supabase/client';

export interface AuditEvent {
  event_type: string;
  table_name?: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  user_agent?: string;
  ip_address?: string;
}

export const logAuditEvent = async (
  eventType: string,
  tableName?: string,
  recordId?: string,
  oldValues?: any,
  newValues?: any,
  additionalData?: any
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Try to use the database function if available
    try {
      const { error } = await supabase.rpc('log_audit_event', {
        p_user_id: user?.id,
        p_event_type: eventType,
        p_table_name: tableName,
        p_record_id: recordId,
        p_old_values: oldValues ? JSON.stringify(oldValues) : null,
        p_new_values: newValues ? JSON.stringify(newValues) : null,
        p_user_agent: navigator.userAgent
      });

      if (error) {
        throw error;
      }
    } catch (dbError) {
      // Fallback to console logging if audit table not available
      console.log('🔍 Audit Event:', {
        user_id: user?.id,
        event_type: eventType,
        table_name: tableName,
        record_id: recordId,
        old_values: oldValues,
        new_values: newValues,
        additional_data: additionalData,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent
      });
    }
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Always log to console as fallback
    console.log('🔍 Audit Event (Fallback):', {
      event_type: eventType,
      table_name: tableName,
      record_id: recordId,
      timestamp: new Date().toISOString()
    });
  }
};

export const logSecurityEvent = async (
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: any
) => {
  try {
    await logAuditEvent(`security_${eventType}`, null, null, null, {
      severity,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

// Specific audit functions for order management
export const logOrderCreated = async (orderId: string, orderDetails: any) => {
  await logAuditEvent('order_created', 'orders', orderId, null, orderDetails);
};

export const logOrderConfirmed = async (orderId: string, wholesalerId: string) => {
  await logAuditEvent('order_confirmed', 'orders', orderId, null, { wholesaler_id: wholesalerId });
};

export const logOrderRejected = async (orderId: string, wholesalerId: string, notes?: string) => {
  await logAuditEvent('order_rejected', 'orders', orderId, null, { 
    wholesaler_id: wholesalerId, 
    notes 
  });
};

export const logPaymentScreenshotUploaded = async (orderId: string, filePath: string) => {
  await logAuditEvent('payment_screenshot_uploaded', 'orders', orderId, null, { 
    file_path: filePath 
  });
};

// Security violation logging
export const logSecurityViolation = async (
  violationType: string,
  details: any,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
) => {
  await logSecurityEvent(`violation_${violationType}`, severity, details);
};
