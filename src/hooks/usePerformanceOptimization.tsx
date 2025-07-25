import React, { useMemo } from 'react';

interface MemoizedQueryResultProps<T> {
  data: T;
  isLoading: boolean;
  error: Error | null;
  children: (result: { data: T; isLoading: boolean; error: Error | null }) => React.ReactNode;
}

// Memoized wrapper to prevent unnecessary re-renders when data hasn't changed
export function MemoizedQueryResult<T>({ 
  data, 
  isLoading, 
  error, 
  children 
}: MemoizedQueryResultProps<T>) {
  const memoizedResult = useMemo(() => ({
    data,
    isLoading,
    error
  }), [data, isLoading, error]);

  return <>{children(memoizedResult)}</>;
}

// Performance optimized list renderer
interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey: (item: T, index: number) => string | number;
  className?: string;
  emptyMessage?: string;
  loadingCount?: number;
  isLoading?: boolean;
}

export function OptimizedList<T>({
  items,
  renderItem,
  getItemKey,
  className,
  emptyMessage = 'No items found',
  loadingCount = 3,
  isLoading = false
}: OptimizedListProps<T>) {
  const memoizedItems = useMemo(() => items, [items]);

  if (isLoading) {
    return (
      <div className={className}>
        {Array.from({ length: loadingCount }, (_, index) => (
          <div key={`loading-${index}`} className="animate-pulse bg-gray-200 rounded h-16 mb-2" />
        ))}
      </div>
    );
  }

  if (!memoizedItems?.length) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={className}>
      {memoizedItems.map((item, index) => (
        <React.Fragment key={getItemKey(item, index)}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}
    </div>
  );
}

// Debounced search hook
import { useState, useEffect, useCallback } from 'react';

export function useDebouncedSearch(initialValue: string = '', delay: number = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, delay]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, []);

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    clearSearch
  };
}

// Intersection observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, hasIntersected, options]);

  return { isIntersecting, hasIntersected };
}