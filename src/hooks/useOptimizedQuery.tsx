
import { useState, useEffect } from 'react';
import { queryOptimizer } from '@/lib/performance/query-optimizer-enhanced';

interface UseOptimizedQueryOptions<T> {
  queryKey: string;
  queryFn: () => Promise<T>;
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}

export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  refetchInterval,
  staleTime = 5 * 60 * 1000
}: UseOptimizedQueryOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchData = async () => {
    if (!enabled) return;

    const now = Date.now();
    if (data && now - lastFetch < staleTime) {
      console.log(`Using stale data for ${queryKey}`);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
      setLastFetch(now);
      console.log(`Fresh data fetched for ${queryKey}`);
    } catch (err) {
      console.error(`Query error for ${queryKey}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [queryKey, enabled]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval, enabled, queryKey]);

  const refetch = () => {
    setLastFetch(0); // Force fresh fetch
    fetchData();
  };

  const invalidate = () => {
    queryOptimizer.clearCache(queryKey);
    refetch();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    invalidate,
    isStale: data && Date.now() - lastFetch > staleTime
  };
}

// Specific optimized hooks for common queries
export function useOptimizedShops(filters: any = {}) {
  return useOptimizedQuery({
    queryKey: `shops_${JSON.stringify(filters)}`,
    queryFn: () => queryOptimizer.getOptimizedShops(filters),
    staleTime: 2 * 60 * 1000 // 2 minutes for shops
  });
}

export function useOptimizedProducts(shopId?: string, filters: any = {}) {
  return useOptimizedQuery({
    queryKey: `products_${shopId || 'all'}_${JSON.stringify(filters)}`,
    queryFn: () => queryOptimizer.getOptimizedProducts(shopId, filters),
    staleTime: 3 * 60 * 1000 // 3 minutes for products
  });
}

export function useOptimizedOrders(userId: string, userRole: 'seller' | 'wholesaler') {
  return useOptimizedQuery({
    queryKey: `orders_${userId}_${userRole}`,
    queryFn: () => queryOptimizer.getOptimizedOrders(userId, userRole),
    staleTime: 30 * 1000, // 30 seconds for orders (more real-time)
    refetchInterval: 60 * 1000 // Refetch every minute
  });
}
