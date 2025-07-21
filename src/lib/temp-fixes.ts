// Temporary fixes for build errors - these should be properly fixed later

import { getCurrentUser } from '@/lib/auth';
import { getSellerOrders, getWholesalerOrders, getProductsByWholesaler } from '@/lib/supabase';

// Wrapper functions that work with React Query
export const getSellerOrdersQuery = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  return getSellerOrders(user.id);
};

export const getWholesalerOrdersQuery = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  return getWholesalerOrders(user.id);
};

export const getProductsByWholesalerQuery = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  return getProductsByWholesaler(user.id);
};

// Simplified upload function
export const simpleUploadImage = async (file: File) => {
  const { uploadImage } = await import('@/lib/products');
  return uploadImage(file);
};