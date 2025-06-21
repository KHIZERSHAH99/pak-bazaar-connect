
import React, { useState, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions<T> {
  fetchFunction: (page: number, limit: number) => Promise<T[]>;
  initialLimit?: number;
  initialPage?: number;
}

interface UseInfiniteScrollReturn<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;
  reset: () => void;
}

export function useInfiniteScroll<T>({
  fetchFunction,
  initialLimit = 20,
  initialPage = 1
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const isInitialized = useRef(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);

      const newItems = await fetchFunction(page, initialLimit);
      
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prevItems => {
          // Avoid duplicates by filtering out items with same id
          const existingIds = new Set(prevItems.map((item: any) => item.id));
          const uniqueNewItems = newItems.filter((item: any) => !existingIds.has(item.id));
          return [...prevItems, ...uniqueNewItems];
        });
        
        setPage(prevPage => prevPage + 1);
        
        // If we got fewer items than requested, we've reached the end
        if (newItems.length < initialLimit) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error('Error loading more items:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, page, initialLimit, loading, hasMore]);

  const refresh = useCallback(async () => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    isInitialized.current = false;
    
    // Trigger initial load
    await loadMore();
  }, [loadMore, initialPage]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    setLoading(false);
    isInitialized.current = false;
  }, [initialPage]);

  // Initial load
  React.useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      loadMore();
    }
  }, [loadMore]);

  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
    reset
  };
}
