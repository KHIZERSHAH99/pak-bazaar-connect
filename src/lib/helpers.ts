import { getCurrentUser } from '@/lib/auth';
import { getSellerOrders, getWholesalerOrders, getProductsByWholesaler } from '@/lib/supabase';

// Helper functions that work with React Query's expected signature

export const getSellerOrdersForQuery = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  return getSellerOrders(user.id);
};

export const getWholesalerOrdersForQuery = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  return getWholesalerOrders(user.id);
};

export const getProductsByWholesalerForQuery = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  return getProductsByWholesaler(user.id);
};