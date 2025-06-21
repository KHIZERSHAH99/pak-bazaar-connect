
import { useState, useMemo } from 'react';
import { Order } from '@/lib/types';

interface UseOrderFiltersProps {
  orders: Order[];
  searchFields: string[];
}

export const useOrderFilters = ({ orders, searchFields }: UseOrderFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return searchFields.some(field => {
          if (field === 'shop_name') {
            return order.shops?.name?.toLowerCase().includes(searchLower);
          }
          if (field === 'id') {
            return order.id.toLowerCase().includes(searchLower);
          }
          return false;
        });
      }

      return true;
    });
  }, [orders, searchTerm, statusFilter, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredOrders
  };
};
