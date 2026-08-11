
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

export const SHOP_LIMITS = {
  MAX_SHOPS_PER_WHOLESALER: 1,
  MAX_PRODUCTS_PER_SHOP: 500,
  MIN_ORDER_AMOUNT: 1000, // PKR
  MAX_ORDER_AMOUNT: 5000000, // PKR 5M
} as const;

export const checkShopCreationLimit = async (): Promise<{ canCreate: boolean; reason?: string }> => {
  const user = await getCurrentUser();
  if (!user) return { canCreate: false, reason: 'User not authenticated' };

  const { data: existingShops, error } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id);

  if (error) {
    console.error('Error checking shop limit:', error);
    return { canCreate: false, reason: 'Failed to check existing shops' };
  }

  if (existingShops.length >= SHOP_LIMITS.MAX_SHOPS_PER_WHOLESALER) {
    return { 
      canCreate: false, 
      reason: `Maximum ${SHOP_LIMITS.MAX_SHOPS_PER_WHOLESALER} shop allowed per wholesaler` 
    };
  }

  return { canCreate: true };
};

export const checkProductCreationLimit = async (shopId: string): Promise<{ canCreate: boolean; reason?: string }> => {
  const { data: existingProducts, error } = await supabase
    .from('products')
    .select('id')
    .eq('shop_id', shopId);

  if (error) {
    console.error('Error checking product limit:', error);
    return { canCreate: false, reason: 'Failed to check existing products' };
  }

  if (existingProducts.length >= SHOP_LIMITS.MAX_PRODUCTS_PER_SHOP) {
    return { 
      canCreate: false, 
      reason: `Maximum ${SHOP_LIMITS.MAX_PRODUCTS_PER_SHOP} products allowed per shop` 
    };
  }

  return { canCreate: true };
};
