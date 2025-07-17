
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getOptimizedSellerOrders, getOptimizedWholesalerOrders, getOrderStats } from '@/lib/orders/performance-optimized';
import { Order } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface UseOptimizedOrdersProps {
  userRole: 'seller' | 'wholesaler';
  refreshInterval?: number;
}

export const useOptimizedOrders = ({ userRole, refreshInterval = 30000 }: UseOptimizedOrdersProps) => {
  const queryClient = useQueryClient();
  
  // Fetch orders with optimized queries
  const {
    data: orders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['optimized-orders', userRole],
    queryFn: () => userRole === 'seller' ? getOptimizedSellerOrders() : getOptimizedWholesalerOrders(),
    refetchInterval,
    staleTime: 10000, // Data is fresh for 10 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  // Fetch order statistics
  const {
    data: stats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['order-stats', userRole],
    queryFn: () => getOrderStats(userRole),
    refetchInterval: refreshInterval * 2, // Refresh stats less frequently
    staleTime: 30000,
  });

  // Invalidate and refetch orders
  const invalidateOrders = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['optimized-orders', userRole] });
    queryClient.invalidateQueries({ queryKey: ['order-stats', userRole] });
  }, [queryClient, userRole]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Failed to Load Orders",
        description: "There was an error loading your orders. Please try again.",
        variant: "destructive"
      });
    }
  }, [error]);

  return {
    orders: orders as Order[],
    stats,
    isLoading,
    statsLoading,
    error,
    refetch,
    invalidateOrders
  };
};
