
import React, { useState, useCallback, useRef, useEffect } from 'react';

interface UseInfiniteScrollProps<T> {
  fetchFunction: (page: number, limit: number) => Promise<T[]>;
  initialLimit?: number;
}

interface UseInfiniteScrollReturn<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  error: string | null;
}

export function useInfiniteScroll<T>({
  fetchFunction,
  initialLimit = 20
}: UseInfiniteScrollProps<T>): UseInfiniteScrollReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return;

    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const newItems = await fetchFunction(page, initialLimit);
      
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => page === 0 ? newItems : [...prev, ...newItems]);
        setPage(prev => prev + 1);
        setHasMore(newItems.length === initialLimit);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error loading more items:', err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [fetchFunction, page, hasMore, initialLimit]);

  const refresh = useCallback(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    setError(null);
    // Trigger initial load
    setTimeout(() => {
      loadMore();
    }, 0);
  }, [loadMore]);

  // Initial load
  useEffect(() => {
    if (items.length === 0 && !isLoadingRef.current) {
      loadMore();
    }
  }, []);

  return {
    items,
    loading,
    hasMore,
    loadMore,
    refresh,
    error
  };
}
