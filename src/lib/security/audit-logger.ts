
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

export interface AuditLogEntry {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class AuditLogger {
  private static instance: AuditLogger;
  private logQueue: AuditLogEntry[] = [];
  private isProcessing = false;

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async log(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    const user = await getCurrentUser();
    
    const auditEntry: AuditLogEntry = {
      ...entry,
      userId: user?.id,
      timestamp: new Date(),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent
    };

    this.logQueue.push(auditEntry);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) return;

    this.isProcessing = true;
    const batch = this.logQueue.splice(0, 10); // Process in batches of 10

    try {
      for (const entry of batch) {
        await this.writeToStorage(entry);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
      // Re-queue failed entries
      this.logQueue.unshift(...batch);
    } finally {
      this.isProcessing = false;
      
      // Continue processing if there are more entries
      if (this.logQueue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }

  private async writeToStorage(entry: AuditLogEntry): Promise<void> {
    try {
      // Try to use the audit function if available
      const { error } = await supabase.rpc('log_audit_event', {
        p_user_id: entry.userId,
        p_event_type: entry.action,
        p_table_name: entry.resource,
        p_record_id: entry.resourceId,
        p_old_values: null,
        p_new_values: JSON.stringify(entry.details),
        p_user_agent: entry.userAgent
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      // Fallback to console logging
      console.log('🔒 AUDIT LOG:', {
        timestamp: entry.timestamp.toISOString(),
        user: entry.userId,
        action: entry.action,
        resource: entry.resource,
        severity: entry.severity,
        details: entry.details,
        ip: entry.ipAddress
      });
    }
  }

  private async getClientIP(): Promise<string | undefined> {
    try {
      // Simple IP detection - in production you'd use a proper service
      return 'client-ip-unavailable';
    } catch {
      return undefined;
    }
  }

  // Convenience methods for different severity levels
  async logInfo(action: string, resource: string, details?: Record<string, any>): Promise<void> {
    await this.log({ action, resource, details, severity: 'low' });
  }

  async logWarning(action: string, resource: string, details?: Record<string, any>): Promise<void> {
    await this.log({ action, resource, details, severity: 'medium' });
  }

  async logError(action: string, resource: string, details?: Record<string, any>): Promise<void> {
    await this.log({ action, resource, details, severity: 'high' });
  }

  async logCritical(action: string, resource: string, details?: Record<string, any>): Promise<void> {
    await this.log({ action, resource, details, severity: 'critical' });
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();

// Convenience functions
export const logUserAction = (action: string, details?: Record<string, any>) => 
  auditLogger.logInfo(action, 'user', details);

export const logOrderAction = (action: string, orderId: string, details?: Record<string, any>) => 
  auditLogger.logInfo(action, 'orders', { ...details, orderId });

export const logPaymentAction = (action: string, details?: Record<string, any>) => 
  auditLogger.logWarning(action, 'payments', details);

export const logSecurityEvent = (action: string, details?: Record<string, any>) => 
  auditLogger.logCritical(action, 'security', details);
