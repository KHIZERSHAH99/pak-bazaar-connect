
import { supabase } from '@/integrations/supabase/client';
import { logAuditEvent } from '@/lib/security/audit-enhanced';

export interface CommissionAnalytics {
  total_sales: number;
  pending_amount: number;
  paid_amount: number;
  total_commissions: number;
}

export const getWholesalerCommissionAnalytics = async (userId: string): Promise<CommissionAnalytics> => {
  try {
    const { data, error } = await supabase
      .from('commission_records')
      .select(`
        *,
        orders!inner(
          total_amount,
          shops!inner(
            owner_id
          )
        )
      `)
      .eq('orders.shops.owner_id', userId);

    if (error) {
      console.error('Error fetching commission analytics:', error);
      throw error;
    }

    const analytics = {
      total_sales: 0,
      pending_amount: 0,
      paid_amount: 0,
      total_commissions: data?.length || 0
    };

    data?.forEach(record => {
      analytics.total_sales += record.sale_amount || 0;
      
      if (record.status === 'pending') {
        analytics.pending_amount += record.commission_amount || 0;
      } else if (record.status === 'paid') {
        analytics.paid_amount += record.commission_amount || 0;
      }
    });

    await logAuditEvent('commission_analytics_viewed', 'commission_records', userId);
    
    return analytics;
  } catch (error) {
    console.error('Error in getWholesalerCommissionAnalytics:', error);
    throw error;
  }
};

export const updateCommissionStatus = async (commissionId: string, status: 'pending' | 'paid') => {
  try {
    const { data, error } = await supabase
      .from('commission_records')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', commissionId)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent('commission_status_updated', 'commission_records', commissionId, 
      { status: 'pending' }, { status });

    return data;
  } catch (error) {
    console.error('Error updating commission status:', error);
    throw error;
  }
};

export const getCommissionRecords = async () => {
  try {
    const { data, error } = await supabase
      .from('commission_records')
      .select(`
        *,
        orders(
          id,
          total_amount,
          created_at,
          shops(
            name,
            owner_id
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching commission records:', error);
    throw error;
  }
};
