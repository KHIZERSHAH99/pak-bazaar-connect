
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { queryOptimizer } from '@/lib/performance/query-optimizer-enhanced';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  apiCalls: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    apiCalls: 0
  });
  
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show performance monitor in development or for admin users
    const isDev = import.meta.env.DEV;
    const isAdmin = localStorage.getItem('user_role') === 'admin';
    setIsVisible(isDev || isAdmin);

    if (!isVisible) return;

    const updateMetrics = () => {
      const cacheStats = queryOptimizer.getCacheStats();
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      setMetrics({
        loadTime: navigation ? Math.round(navigation.loadEventEnd - navigation.fetchStart) : 0,
        renderTime: Math.round(performance.now()),
        cacheHitRate: Math.round(cacheStats.hitRate * 100),
        memoryUsage: (performance as any).memory ? 
          Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) : 0,
        apiCalls: cacheStats.totalEntries
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const getPerformanceStatus = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return 'success';
    if (value <= thresholds[1]) return 'warning';
    return 'destructive';
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          Performance Monitor
          <Badge variant="outline" className="text-xs">
            {import.meta.env.DEV ? 'DEV' : 'PROD'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span>Page Load:</span>
          <Badge variant={getPerformanceStatus(metrics.loadTime, [2000, 4000])}>
            {metrics.loadTime}ms
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span>Render Time:</span>
          <Badge variant={getPerformanceStatus(metrics.renderTime, [100, 300])}>
            {metrics.renderTime}ms
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span>Cache Hit Rate:</span>
          <Badge variant={metrics.cacheHitRate > 70 ? 'success' : 'warning'}>
            {metrics.cacheHitRate}%
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span>Memory:</span>
          <Badge variant={getPerformanceStatus(metrics.memoryUsage, [50, 100])}>
            {metrics.memoryUsage}MB
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span>API Calls:</span>
          <Badge variant="outline">
            {metrics.apiCalls}
          </Badge>
        </div>
        
        <div className="pt-2 border-t">
          <button 
            onClick={() => queryOptimizer.clearCache()}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear Cache
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;
