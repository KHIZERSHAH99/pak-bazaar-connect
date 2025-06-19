
import { useState, useEffect, useMemo } from 'react';
import { Order } from '@/lib/types';

interface UseOrderFiltersProps {
  orders: Order[];
  searchFields: (keyof Order | string)[];
}

export const useOrderFilters = ({ orders, searchFields }: UseOrderFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => {
        return searchFields.some(field => {
          if (field === 'buyer_name') {
            return order.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase());
          }
          if (field === 'shop_name') {
            return order.shops?.name?.toLowerCase().includes(searchTerm.toLowerCase());
          }
          if (field === 'id') {
            return order.id.toLowerCase().includes(searchTerm.toLowerCase());
          }
          return false;
        });
      });
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    return filtered;
  }, [orders, searchTerm, statusFilter, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredOrders
  };
};
