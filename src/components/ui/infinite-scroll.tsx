
import React, { useEffect, useRef, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface InfiniteScrollProps {
  children: React.ReactNode;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  threshold?: number;
  className?: string;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  loading,
  hasMore,
  onLoadMore,
  threshold = 100,
  className
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    
    if (
      target.isIntersecting && 
      hasMore && 
      !loading && 
      !isLoadingRef.current
    ) {
      isLoadingRef.current = true;
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);

  useEffect(() => {
    if (loading) {
      isLoadingRef.current = false;
    }
  }, [loading]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0.1
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection, threshold]);

  return (
    <div className={className}>
      {children}
      
      {/* Sentinel element for intersection observer */}
      <div ref={sentinelRef} className="h-1" />
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" text="Loading more..." />
        </div>
      )}
      
      {/* End of content indicator */}
      {!hasMore && !loading && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="font-poppins text-sm">You've reached the end!</p>
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
