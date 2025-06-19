
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { CommissionRecord, CommissionStatus } from '@/lib/types';
import { logCommissionCreated, logUserSuspended, logUserUnsuspended } from '@/lib/security/audit-enhanced';

// Enhanced commission management with better error handling and audit logging
export const createCommissionRecord = async (orderId: string, wholesalerId: string, saleAmount: number) => {
  const commissionRate = 0.05; // 5%
  const commissionAmount = saleAmount * commissionRate;

  const commissionData = {
    wholesaler_id: wholesalerId,
    order_id: orderId,
    sale_amount: saleAmount,
    commission_rate: commissionRate * 100, // Store as percentage
    commission_amount: commissionAmount,
    status: 'pending' as CommissionStatus
  };

  const { data, error } = await supabase
    .from('commission_records')
    .insert([commissionData])
    .select()
    .single();

  if (error) {
    console.error('Error creating commission record:', error);
    throw new Error(`Failed to create commission record: ${error.message}`);
  }

  // Log audit event
  await logCommissionCreated(data.id, {
    wholesaler_id: wholesalerId,
    sale_amount: saleAmount,
    commission_amount: commissionAmount
  });

  return data;
};

// Enhanced suspension with audit logging
export const suspendWholesalerEnhanced = async (wholesalerId: string, reason: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Check if current user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Only admins can suspend users');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_suspended: true,
      suspension_reason: reason,
      updated_at: new Date().toISOString()
    })
    .eq('id', wholesalerId)
    .select()
    .single();

  if (error) {
    console.error('Error suspending wholesaler:', error);
    throw new Error(`Failed to suspend wholesaler: ${error.message}`);
  }

  // Log audit event
  await logUserSuspended(wholesalerId, reason);

  return data;
};

// Enhanced unsuspension with audit logging
export const unsuspendWholesalerEnhanced = async (wholesalerId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Check if current user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Only admins can unsuspend users');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_suspended: false,
      suspension_reason: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', wholesalerId)
    .select()
    .single();

  if (error) {
    console.error('Error unsuspending wholesaler:', error);
    throw new Error(`Failed to unsuspend wholesaler: ${error.message}`);
  }

  // Log audit event
  await logUserUnsuspended(wholesalerId);

  return data;
};

// Get wholesaler commission analytics
export const getWholesalerCommissionAnalytics = async (wholesalerId: string) => {
  const { data, error } = await supabase
    .from('commission_records')
    .select('*')
    .eq('wholesaler_id', wholesalerId);

  if (error) {
    console.error('Error fetching commission analytics:', error);
    return {
      total_commissions: 0,
      pending_amount: 0,
      paid_amount: 0,
      total_sales: 0
    };
  }

  const analytics = data.reduce((acc, record) => {
    acc.total_commissions += 1;
    acc.total_sales += Number(record.sale_amount);
    
    if (record.status === 'pending') {
      acc.pending_amount += Number(record.commission_amount);
    } else if (record.status === 'paid') {
      acc.paid_amount += Number(record.commission_amount);
    }
    
    return acc;
  }, {
    total_commissions: 0,
    pending_amount: 0,
    paid_amount: 0,
    total_sales: 0
  });

  return analytics;
};

// Check if wholesaler should be suspended (threshold: 10,000 PKR unpaid)
export const checkSuspensionThreshold = async (wholesalerId: string) => {
  const analytics = await getWholesalerCommissionAnalytics(wholesalerId);
  const SUSPENSION_THRESHOLD = 10000; // 10,000 PKR
  
  return {
    shouldSuspend: analytics.pending_amount > SUSPENSION_THRESHOLD,
    pendingAmount: analytics.pending_amount,
    threshold: SUSPENSION_THRESHOLD
  };
};
