
import { supabase } from '@/integrations/supabase/client';
import { Order, CommissionRecord } from '@/lib/types';
import { WholesalerMonthlySales } from '@/lib/types';

export const getWholesalerMonthlySales = async (startDate: string): Promise<WholesalerMonthlySales> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('Not authenticated');
  }

  // Get orders for the current month
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', startDate)
    .lt('created_at', new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 1).toISOString())
    .eq('status', 'confirmed');

  if (ordersError) throw ordersError;

  const totalOrders = orders?.length || 0;
  const totalSales = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

  const date = new Date(startDate);
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();

  return {
    month,
    year,
    total_orders: totalOrders,
    total_sales: totalSales,
    pending_commission: 0,
    paid_commission: 0,
    commission_earned: totalSales * 0.05 // 5% default commission
  };
};
