
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Debounce to prevent duplicate calls
    const timeoutId = setTimeout(() => {
      // Track page views only once per location change
      if (import.meta.env.DEV) {
        console.log('Page view:', {
          path: location.pathname,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent.slice(0, 100), // Truncate for performance
          referrer: document.referrer,
          title: document.title
        });
      }

      // Optimized performance tracking - only measure what's needed
      if ('performance' in window && location.pathname !== '/') {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (perfData && import.meta.env.DEV) {
            console.log('Performance metrics:', {
              path: location.pathname,
              loadTime: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
              domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
              firstContentfulPaint: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0)
            });
          }
        }, 500); // Reduced timeout for faster feedback
      }
    }, 100); // Debounce duplicate calls

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  return {
    trackEvent: (eventName: string, properties?: Record<string, any>) => {
      if (import.meta.env.DEV) {
        console.log('Custom event:', {
          event: eventName,
          properties,
          path: location.pathname,
          timestamp: new Date().toISOString()
        });
      }
    }
  };
};
