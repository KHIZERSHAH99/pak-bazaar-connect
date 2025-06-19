
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { CommissionRecord, CommissionStatus } from '@/lib/types';

// Get all commission records (admin only)
export const getAllCommissionRecords = async (): Promise<CommissionRecord[]> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('commission_records')
    .select(`
      *,
      orders(total_amount, created_at, buyer_name),
      profiles(email, business_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching commission records:', error);
    return [];
  }

  return (data || []).map(record => ({
    ...record,
    status: record.status as CommissionStatus
  }));
};

// Get commission records for a specific wholesaler
export const getWholesalerCommissions = async (): Promise<CommissionRecord[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('commission_records')
    .select(`
      *,
      orders(total_amount, created_at, buyer_name)
    `)
    .eq('wholesaler_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching wholesaler commissions:', error);
    return [];
  }

  return (data || []).map(record => ({
    ...record,
    status: record.status as CommissionStatus
  }));
};

// Mark commission as paid (admin only)
export const markCommissionAsPaid = async (commissionId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('commission_records')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString()
    })
    .eq('id', commissionId)
    .select();

  if (error) {
    console.error('Error marking commission as paid:', error);
    throw error;
  }

  return data[0];
};

// Get unpaid commissions for a wholesaler
export const getUnpaidCommissions = async (wholesalerId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('commission_records')
    .select('commission_amount')
    .eq('wholesaler_id', wholesalerId)
    .eq('status', 'pending');

  if (error) {
    console.error('Error fetching unpaid commissions:', error);
    return 0;
  }

  return data.reduce((total, record) => total + Number(record.commission_amount), 0);
};

// Suspend wholesaler due to unpaid commissions (admin only)
export const suspendWholesaler = async (wholesalerId: string, reason: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_suspended: true,
      suspension_reason: reason
    })
    .eq('id', wholesalerId)
    .select();

  if (error) {
    console.error('Error suspending wholesaler:', error);
    throw error;
  }

  return data[0];
};

// Unsuspend wholesaler (admin only)
export const unsuspendWholesaler = async (wholesalerId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_suspended: false,
      suspension_reason: null
    })
    .eq('id', wholesalerId)
    .select();

  if (error) {
    console.error('Error unsuspending wholesaler:', error);
    throw error;
  }

  return data[0];
};

// Get commission summary for admin dashboard
export const getCommissionSummary = async () => {
  const { data, error } = await supabase
    .from('commission_records')
    .select('status, commission_amount');

  if (error) {
    console.error('Error fetching commission summary:', error);
    return {
      total_pending: 0,
      total_paid: 0,
      total_amount: 0
    };
  }

  const summary = data.reduce((acc, record) => {
    const amount = Number(record.commission_amount);
    acc.total_amount += amount;
    
    if (record.status === 'pending') {
      acc.total_pending += amount;
    } else if (record.status === 'paid') {
      acc.total_paid += amount;
    }
    
    return acc;
  }, {
    total_pending: 0,
    total_paid: 0,
    total_amount: 0
  });

  return summary;
};
