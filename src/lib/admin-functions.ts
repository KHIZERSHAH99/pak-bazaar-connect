
import { supabase } from '@/integrations/supabase/client';
import { handleError } from './enhanced-error-handling';

// Admin function to approve all pending products
export const approveAllPendingProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ verification_status: 'approved' })
      .eq('verification_status', 'pending')
      .select();

    if (error) throw error;

    console.log(`Approved ${data?.length || 0} products`);
    return data;
  } catch (error) {
    await handleError(error, 'approveAllPendingProducts');
    throw error;
  }
};

// Admin function to approve all pending ads
export const approveAllPendingAds = async () => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .update({ status: 'active' })
      .eq('status', 'pending')
      .select();

    if (error) throw error;

    console.log(`Approved ${data?.length || 0} ads`);
    return data;
  } catch (error) {
    await handleError(error, 'approveAllPendingAds');
    throw error;
  }
};

// Admin function to get system statistics
export const getSystemStats = async () => {
  try {
    const [usersResult, shopsResult, productsResult, ordersResult] = await Promise.all([
      supabase.from('profiles').select('role', { count: 'exact' }),
      supabase.from('shops').select('id', { count: 'exact' }),
      supabase.from('products').select('verification_status', { count: 'exact' }),
      supabase.from('orders').select('status', { count: 'exact' })
    ]);

    // Simplify return type to avoid deep instantiation
    const stats = {
      users: usersResult.count || 0,
      shops: shopsResult.count || 0,
      products: productsResult.count || 0,
      orders: ordersResult.count || 0,
      userRoles: {} as { [key: string]: number },
      productStatuses: {} as { [key: string]: number }
    };

    // Process user roles
    if (usersResult.data) {
      for (const user of usersResult.data) {
        stats.userRoles[user.role] = (stats.userRoles[user.role] || 0) + 1;
      }
    }

    // Process product statuses
    if (productsResult.data) {
      for (const product of productsResult.data) {
        stats.productStatuses[product.verification_status] = (stats.productStatuses[product.verification_status] || 0) + 1;
      }
    }

    return stats;
  } catch (error) {
    await handleError(error, 'getSystemStats');
    throw error;
  }
};

// Admin function to bulk update verification status - simplified to avoid type issues
export const bulkUpdateVerificationStatus = async (
  table: 'products' | 'ads',
  status: string,
  ids?: string[]
) => {
  try {
    if (table === 'products') {
      let query = supabase.from('products').update({ verification_status: status });
      
      if (ids && ids.length > 0) {
        query = query.in('id', ids);
      } else {
        query = query.eq('verification_status', 'pending');
      }
      
      const { data, error } = await query.select();
      if (error) throw error;
      return data;
    } else {
      let query = supabase.from('ads').update({ status: status });
      
      if (ids && ids.length > 0) {
        query = query.in('id', ids);
      } else {
        query = query.eq('status', 'pending');
      }
      
      const { data, error } = await query.select();
      if (error) throw error;
      return data;
    }
  } catch (error) {
    await handleError(error, 'bulkUpdateVerificationStatus');
    throw error;
  }
};
