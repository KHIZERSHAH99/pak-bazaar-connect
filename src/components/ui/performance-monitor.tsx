
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { queryOptimizer } from '@/lib/performance/query-optimizer-enhanced';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  apiCalls: number;
}

const PerformanceMonitor: React.FC = () => {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    apiCalls: 0
  });

  const isAdmin = profile?.role === 'admin';
  const mountTimeRef = React.useRef(performance.now());

  useEffect(() => {
    if (!isAdmin) return;

    // Capture render time once after mount
    const renderTime = Math.round(performance.now() - mountTimeRef.current);

    const updateMetrics = () => {
      const cacheStats = queryOptimizer.getCacheStats();
      
      // Use First Contentful Paint for real user-perceived load time
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
      const loadTime = fcp ? Math.round(fcp.startTime) : 0;
      
      setMetrics({
        loadTime,
        renderTime,
        cacheHitRate: Math.round(cacheStats.hitRate * 100),
        memoryUsage: (performance as any).memory ? 
          Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) : 0,
        apiCalls: cacheStats.totalEntries
      });
    };

    // Delay initial update to ensure FCP is available
    const initialTimeout = setTimeout(updateMetrics, 500);
    const interval = setInterval(updateMetrics, 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isAdmin]);

  if (!isAdmin) return null;

  const getPerformanceStatus = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return 'success';
    if (value <= thresholds[1]) return 'warning';
    return 'destructive';
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          Performance Monitor (Admin)
          <Badge variant="destructive" className="text-xs">
            ADMIN
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span>FCP:</span>
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
