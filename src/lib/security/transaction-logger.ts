
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

export interface TransactionLogEntry {
  id?: string;
  userId?: string;
  type: 'order_created' | 'order_confirmed' | 'order_rejected' | 'payment_uploaded' | 'commission_calculated';
  entityType: 'order' | 'product' | 'shop' | 'payment' | 'commission';
  entityId: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export class TransactionLogger {
  private static instance: TransactionLogger;
  private pendingLogs: TransactionLogEntry[] = [];

  static getInstance(): TransactionLogger {
    if (!TransactionLogger.instance) {
      TransactionLogger.instance = new TransactionLogger();
    }
    return TransactionLogger.instance;
  }

  async logTransaction(entry: Omit<TransactionLogEntry, 'timestamp' | 'userId'>): Promise<void> {
    const user = await getCurrentUser();
    
    const logEntry: TransactionLogEntry = {
      ...entry,
      userId: user?.id,
      timestamp: new Date()
    };

    this.pendingLogs.push(logEntry);
    
    // Process logs in batches to avoid overwhelming the system
    if (this.pendingLogs.length >= 5) {
      await this.flushLogs();
    }
  }

  private async flushLogs(): Promise<void> {
    if (this.pendingLogs.length === 0) return;

    const batch = [...this.pendingLogs];
    this.pendingLogs = [];

    try {
      // Store in local storage as backup (development only — avoid persisting
      // transaction state in production browsers where XSS could exfiltrate it)
      if (import.meta.env.DEV) {
        const stored = localStorage.getItem('transaction_logs') || '[]';
        const existingLogs = JSON.parse(stored);
        const updatedLogs = [...existingLogs, ...batch].slice(-100); // Keep last 100
        localStorage.setItem('transaction_logs', JSON.stringify(updatedLogs));
      }

      // Try to log to audit system
      for (const entry of batch) {
        try {
          await supabase.rpc('log_audit_event', {
            p_user_id: entry.userId,
            p_event_type: `transaction_${entry.type}`,
            p_table_name: entry.entityType,
            p_record_id: entry.entityId,
            p_old_values: entry.beforeState ? JSON.stringify(entry.beforeState) : null,
            p_new_values: entry.afterState ? JSON.stringify(entry.afterState) : null,
            p_user_agent: navigator.userAgent
          });
        } catch (error) {
          console.error('Transaction log error:', error);
        }
      }
    } catch (error) {
      console.error('Failed to flush transaction logs:', error);
      // Re-queue failed logs
      this.pendingLogs.unshift(...batch);
    }
  }

  async logOrderCreation(orderId: string, orderData: Record<string, any>): Promise<void> {
    await this.logTransaction({
      type: 'order_created',
      entityType: 'order',
      entityId: orderId,
      afterState: orderData,
      metadata: { action: 'create' }
    });
  }

  async logOrderStatusChange(
    orderId: string, 
    oldStatus: string, 
    newStatus: string, 
    metadata?: Record<string, any>
  ): Promise<void> {
    const type = newStatus === 'confirmed' ? 'order_confirmed' : 'order_rejected';
    
    await this.logTransaction({
      type,
      entityType: 'order',
      entityId: orderId,
      beforeState: { status: oldStatus },
      afterState: { status: newStatus },
      metadata
    });
  }

  async logPaymentUpload(orderId: string, paymentDetails: Record<string, any>): Promise<void> {
    await this.logTransaction({
      type: 'payment_uploaded',
      entityType: 'payment',
      entityId: orderId,
      afterState: paymentDetails,
      metadata: { action: 'upload_screenshot' }
    });
  }

  async logCommissionCalculation(orderId: string, commissionData: Record<string, any>): Promise<void> {
    await this.logTransaction({
      type: 'commission_calculated',
      entityType: 'commission',
      entityId: orderId,
      afterState: commissionData,
      metadata: { action: 'calculate' }
    });
  }

  // Flush any remaining logs when the page unloads
  setupAutoFlush(): void {
    window.addEventListener('beforeunload', () => {
      this.flushLogs();
    });

    // Also flush periodically
    setInterval(() => {
      if (this.pendingLogs.length > 0) {
        this.flushLogs();
      }
    }, 30000); // Every 30 seconds
  }
}

export const transactionLogger = TransactionLogger.getInstance();

// Initialize auto-flush
transactionLogger.setupAutoFlush();
