
import React, { useState, useRef, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  height?: string;
  threshold?: number;
  className?: string;
}

const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  children,
  height = '200px',
  threshold = 0.1,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setIsVisible(true);
          setHasIntersected(true);
          observer.disconnect(); // Disconnect after first intersection
        }
      },
      { 
        threshold,
        rootMargin: '50px' // Start loading 50px before element comes into view
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, hasIntersected]);

  return (
    <div ref={ref} className={className} style={{ minHeight: height }}>
      {isVisible ? (
        children
      ) : (
        <div className="flex items-center justify-center w-full" style={{ height }}>
          <LoadingSpinner size="md" text="Loading content..." />
        </div>
      )}
    </div>
  );
};

export default LazyLoadWrapper;
