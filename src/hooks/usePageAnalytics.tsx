
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    const trackPageView = () => {
      // Log page view for analytics
      console.log('Page view:', {
        path: location.pathname,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        title: document.title
      });

      // Track performance metrics
      if ('performance' in window) {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (perfData) {
            console.log('Performance metrics:', {
              path: location.pathname,
              loadTime: perfData.loadEventEnd - perfData.loadEventStart,
              domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
              firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
            });
          }
        }, 1000);
      }
    };

    trackPageView();
  }, [location.pathname]);

  return {
    trackEvent: (eventName: string, properties?: Record<string, any>) => {
      console.log('Custom event:', {
        event: eventName,
        properties,
        path: location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  };
};
