import { supabase } from '@/integrations/supabase/client';

export interface ShippingCalculation {
  cost: number;
  method: string;
  delivery_days: number;
  message: string;
}

export const calculateShippingCost = async (
  shopId: string,
  orderAmount: number,
  buyerCity?: string,
  totalWeight: number = 0,
  isExpress: boolean = false
): Promise<ShippingCalculation> => {
  try {
    const { data, error } = await supabase.rpc('calculate_shipping_cost', {
      p_shop_id: shopId,
      p_order_amount: orderAmount,
      p_buyer_city: buyerCity || null,
      p_total_weight: totalWeight,
      p_is_express: isExpress,
    });

    if (error) {
      console.error('Error calculating shipping:', error);
      return {
        cost: 150,
        method: 'default',
        delivery_days: 3,
        message: 'Standard shipping',
      };
    }

    return data as unknown as ShippingCalculation;
  } catch (error) {
    console.error('Error in calculateShippingCost:', error);
    return {
      cost: 150,
      method: 'default',
      delivery_days: 3,
      message: 'Standard shipping',
    };
  }
};

export const getShippingConfig = async (shopId: string) => {
  const { data, error } = await supabase
    .from('shipping_configs')
    .select('*')
    .eq('shop_id', shopId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching shipping config:', error);
    return null;
  }

  return data;
};
