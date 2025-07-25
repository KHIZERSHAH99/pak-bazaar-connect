import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CachedQueryOptions<T> {
  queryKey: (string | number | boolean | null | undefined)[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  cacheTime?: number;
  enabled?: boolean;
  select?: (data: T) => any;
}

export function useCachedQuery<T>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000, // 5 minutes
  cacheTime = 10 * 60 * 1000, // 10 minutes
  enabled = true,
  select
}: CachedQueryOptions<T>) {
  // Memoize query key to prevent unnecessary re-renders
  const memoizedQueryKey = useMemo(() => queryKey, [JSON.stringify(queryKey)]);

  return useQuery({
    queryKey: memoizedQueryKey,
    queryFn,
    staleTime,
    gcTime: cacheTime,
    enabled,
    select,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error: any) => {
      // Don't retry on 400-level errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 2;
    }
  });
}

// Optimized queries for common data patterns
export const useCachedProfile = (userId?: string) => {
  return useCachedQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // Profile data is more stable
  });
};

export const useCachedShops = (ownerId?: string) => {
  return useCachedQuery({
    queryKey: ['shops', ownerId],
    queryFn: async () => {
      if (!ownerId) throw new Error('Owner ID required');
      
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!ownerId,
  });
};

export const useCachedProducts = (shopIds?: string[]) => {
  return useCachedQuery({
    queryKey: ['products', ...(shopIds || [])],
    queryFn: async () => {
      if (!shopIds?.length) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('shop_id', shopIds)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!shopIds?.length,
    staleTime: 2 * 60 * 1000, // Products change more frequently
  });
};

export const useCachedOrders = (userId?: string, role?: string) => {
  return useCachedQuery({
    queryKey: ['orders', userId, role],
    queryFn: async () => {
      if (!userId || !role) return [];
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          shops!fk_orders_shop_id(id, name, contact, address, postal_code, owner_id)
        `);

      if (role === 'seller') {
        query = query.eq('buyer_id', userId);
      } else if (role === 'wholesaler') {
        query = query.eq('shops.owner_id', userId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50); // Limit to prevent large payloads
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId && !!role,
    staleTime: 30 * 1000, // Orders change frequently
  });
};

// Prefetch utility for critical data
export const prefetchCriticalData = async (userId: string, role: string) => {
  const queryClient = (await import('@tanstack/react-query')).QueryClient;
  const client = new queryClient();

  // Prefetch profile
  client.prefetchQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

  // Prefetch role-specific data
  if (role === 'wholesaler') {
    client.prefetchQuery({
      queryKey: ['shops', userId],
      queryFn: async () => {
        const { data } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', userId);
        return data;
      },
    });
  }
};