
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { SHOP_LIMITS } from './shop-limitations';

export interface OrderValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateOrderCreation = async (
  shopId: string,
  totalAmount: number,
  buyerDetails: {
    name: string;
    phone: string;
    address?: string;
  }
): Promise<OrderValidationResult> => {
  const result: OrderValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  const user = await getCurrentUser();
  if (!user) {
    result.isValid = false;
    result.errors.push('User authentication required');
    return result;
  }

  // Check if user is trying to order from own shop
  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('owner_id, name')
    .eq('id', shopId)
    .single();

  if (shopError) {
    result.isValid = false;
    result.errors.push('Invalid shop specified');
    return result;
  }

  if (shop.owner_id === user.id) {
    result.isValid = false;
    result.errors.push('Cannot order from your own shop');
    return result;
  }

  // Validate order amount
  if (totalAmount < SHOP_LIMITS.MIN_ORDER_AMOUNT) {
    result.isValid = false;
    result.errors.push(`Minimum order amount is PKR ${SHOP_LIMITS.MIN_ORDER_AMOUNT.toLocaleString()}`);
  }

  if (totalAmount > SHOP_LIMITS.MAX_ORDER_AMOUNT) {
    result.isValid = false;
    result.errors.push(`Maximum order amount is PKR ${SHOP_LIMITS.MAX_ORDER_AMOUNT.toLocaleString()}`);
  }

  // Validate buyer details
  if (!buyerDetails.name?.trim()) {
    result.isValid = false;
    result.errors.push('Buyer name is required');
  }

  if (!buyerDetails.phone?.trim()) {
    result.isValid = false;
    result.errors.push('Buyer phone is required');
  }

  // Check for suspicious ordering patterns
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, created_at, total_amount')
    .eq('buyer_id', user.id)
    .eq('shop_id', shopId)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (recentOrders && recentOrders.length > 5) {
    result.warnings.push('Multiple orders to same shop in 24 hours detected');
  }

  const totalRecentAmount = recentOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
  if (totalRecentAmount > 1000000) { // 1M PKR
    result.warnings.push('High volume orders detected in recent period');
  }

  return result;
};

export const validateOrderStatusChange = async (
  orderId: string,
  newStatus: string,
  notes?: string
): Promise<OrderValidationResult> => {
  const result: OrderValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  const user = await getCurrentUser();
  if (!user) {
    result.isValid = false;
    result.errors.push('User authentication required');
    return result;
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      shops!shop_id(owner_id)
    `)
    .eq('id', orderId)
    .single();

  if (error || !order) {
    result.isValid = false;
    result.errors.push('Order not found');
    return result;
  }

  // Check authorization
  const isShopOwner = order.shops?.owner_id === user.id;
  const isOrderOwner = order.buyer_id === user.id;

  if (!isShopOwner && !isOrderOwner) {
    result.isValid = false;
    result.errors.push('Unauthorized to modify this order');
    return result;
  }

  // Validate status transitions
  const validTransitions: Record<string, string[]> = {
    'pending': ['confirmed', 'rejected'],
    'confirmed': ['completed'],
    'rejected': [], // Final state
    'completed': [] // Final state
  };

  if (!validTransitions[order.status]?.includes(newStatus)) {
    result.isValid = false;
    result.errors.push(`Invalid status transition from ${order.status} to ${newStatus}`);
  }

  // Require notes for rejection
  if (newStatus === 'rejected' && !notes?.trim()) {
    result.isValid = false;
    result.errors.push('Rejection reason is required');
  }

  return result;
};
