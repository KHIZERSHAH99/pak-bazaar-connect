
import { useMemo } from 'react';
import { Order } from '@/lib/types';

export const useOrderCounts = (orders: Order[]) => {
  return useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      rejected: orders.filter(o => o.status === 'rejected').length,
      completed: orders.filter(o => o.status === 'completed').length
    };
  }, [orders]);
};
