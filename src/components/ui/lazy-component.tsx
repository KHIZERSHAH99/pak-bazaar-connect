
import React, { Suspense, lazy } from 'react';
import EnhancedLoadingSpinner from './enhanced-loading-spinner';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
}

export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  fallbackComponent?: React.ComponentType
) {
  const LazyComponent = lazy(importFunction);
  
  return React.forwardRef<any, React.ComponentProps<T> & LazyComponentProps>((props, ref) => {
    const { fallback, error, className, ...componentProps } = props;
    
    const defaultFallback = fallback || (
      <div className={className}>
        <EnhancedLoadingSpinner 
          size="md" 
          text="Loading component..." 
          variant="spinner"
        />
      </div>
    );

    return (
      <Suspense fallback={defaultFallback}>
        <LazyComponent {...(componentProps as any)} />
      </Suspense>
    );
  });
}

// Performance monitoring for lazy components
export function withPerformanceMonitoring<T extends React.ComponentType<any>>(
  Component: T,
  componentName: string
) {
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => {
    React.useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        if (renderTime > 100) { // Log slow renders
          console.warn(`Slow render detected for ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
      };
    });

    return <Component {...(props as any)} />;
  });
}
