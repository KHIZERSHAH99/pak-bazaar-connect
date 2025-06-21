
import { useState, useMemo } from 'react';
import { Order, OrderStatus } from '@/lib/types';

interface UseOrderFiltersProps {
  orders: Order[];
  searchFields: string[];
}

interface UseOrderFiltersReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: OrderStatus | 'all';
  setStatusFilter: (status: OrderStatus | 'all') => void;
  filteredOrders: Order[];
}

export const useOrderFilters = ({ orders, searchFields }: UseOrderFiltersProps): UseOrderFiltersReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        return searchFields.some(field => {
          const fieldParts = field.split('.');
          let value: any = order;
          
          for (const part of fieldParts) {
            value = value?.[part];
            if (value === undefined || value === null) break;
          }
          
          if (typeof value === 'string') {
            return value.toLowerCase().includes(lowerSearchTerm);
          } else if (typeof value === 'number') {
            return value.toString().includes(lowerSearchTerm);
          }
          
          return false;
        });
      });
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
