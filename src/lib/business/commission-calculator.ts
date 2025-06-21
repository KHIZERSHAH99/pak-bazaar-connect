
import { supabase } from '@/integrations/supabase/client';

export interface CommissionCalculation {
  saleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  platformFee: number;
  netCommission: number;
  taxAmount: number;
}

export const COMMISSION_RATES = {
  DEFAULT_RATE: 5.0, // 5%
  PLATFORM_FEE: 1.0, // 1%
  TAX_RATE: 0.5, // 0.5%
  VOLUME_DISCOUNTS: [
    { minAmount: 1000000, rate: 4.5 }, // 1M+ gets 4.5%
    { minAmount: 500000, rate: 4.8 },  // 500K+ gets 4.8%
    { minAmount: 100000, rate: 4.9 },  // 100K+ gets 4.9%
  ]
} as const;

export const calculateCommission = (
  saleAmount: number,
  customRate?: number
): CommissionCalculation => {
  // Determine commission rate
  let commissionRate = customRate || COMMISSION_RATES.DEFAULT_RATE;
  
  if (!customRate) {
    // Apply volume discounts
    for (const discount of COMMISSION_RATES.VOLUME_DISCOUNTS) {
      if (saleAmount >= discount.minAmount) {
        commissionRate = discount.rate;
        break;
      }
    }
  }

  const commissionAmount = (saleAmount * commissionRate) / 100;
  const platformFee = (saleAmount * COMMISSION_RATES.PLATFORM_FEE) / 100;
  const taxAmount = (commissionAmount * COMMISSION_RATES.TAX_RATE) / 100;
  const netCommission = commissionAmount - platformFee - taxAmount;

  return {
    saleAmount,
    commissionRate,
    commissionAmount,
    platformFee,
    netCommission,
    taxAmount
  };
};

export const createCommissionRecord = async (
  orderId: string,
  wholesalerId: string,
  saleAmount: number,
  customRate?: number
): Promise<string | null> => {
  try {
    const calculation = calculateCommission(saleAmount, customRate);

    const { data, error } = await supabase
      .from('commission_records')
      .insert([{
        wholesaler_id: wholesalerId,
        order_id: orderId,
        sale_amount: saleAmount,
        commission_rate: calculation.commissionRate,
        commission_amount: calculation.commissionAmount,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating commission record:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Commission calculation error:', error);
    return null;
  }
};

export const getWholesalerCommissionSummary = async (
  wholesalerId: string,
  startDate?: Date,
  endDate?: Date
) => {
  try {
    let query = supabase
      .from('commission_records')
      .select('*')
      .eq('wholesaler_id', wholesalerId);

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching commission summary:', error);
      return null;
    }

    const summary = data.reduce((acc, record) => {
      acc.totalSales += Number(record.sale_amount);
      acc.totalCommission += Number(record.commission_amount);
      
      if (record.status === 'pending') {
        acc.pendingCommission += Number(record.commission_amount);
      } else if (record.status === 'paid') {
        acc.paidCommission += Number(record.commission_amount);
      }
      
      acc.recordCount++;
      return acc;
    }, {
      totalSales: 0,
      totalCommission: 0,
      pendingCommission: 0,
      paidCommission: 0,
      recordCount: 0
    });

    return summary;
  } catch (error) {
    console.error('Error calculating commission summary:', error);
    return null;
  }
};

export const processCommissionPayment = async (
  commissionId: string,
  paymentReference: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('commission_records')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_reference: paymentReference
      })
      .eq('id', commissionId);

    if (error) {
      console.error('Error processing commission payment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Commission payment processing error:', error);
    return false;
  }
};
