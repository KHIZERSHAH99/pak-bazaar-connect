
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { WholesalerMonthlySales } from '@/lib/types';

// Get wholesaler monthly sales
export const getWholesalerMonthlySales = async (month?: string): Promise<WholesalerMonthlySales> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const targetDate = month ? new Date(month) : new Date();
  
  const { data, error } = await supabase
    .rpc('get_wholesaler_monthly_sales', {
      wholesaler_uuid: user.id,
      target_month: targetDate.toISOString().split('T')[0]
    });

  if (error) {
    console.error('Error fetching monthly sales:', error);
    throw error;
  }

  return data[0] || {
    total_orders: 0,
    total_sales: 0,
    pending_commission: 0,
    paid_commission: 0
  };
};
