
import React, { useEffect, useState } from 'react';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PerformanceMetrics {
  loadTime: number;
  connectionType: string;
  isOnline: boolean;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    connectionType: 'unknown',
    isOnline: navigator.onLine
  });
  const [showSlowConnectionWarning, setShowSlowConnectionWarning] = useState(false);

  useEffect(() => {
    // Measure initial load time
    const loadTime = performance.now();
    setMetrics(prev => ({ ...prev, loadTime }));

    // Get connection info if available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      setMetrics(prev => ({ 
        ...prev, 
        connectionType: connection.effectiveType || 'unknown' 
      }));

      // Show warning for slow connections
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        setShowSlowConnectionWarning(true);
      }
    }

    // Listen for online/offline events
    const handleOnline = () => setMetrics(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setMetrics(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!metrics.isOnline) {
    return (
      <Alert variant="destructive" className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="font-poppins">
          You're offline. Some features may not be available.
        </AlertDescription>
      </Alert>
    );
  }

  if (showSlowConnectionWarning) {
    return (
      <Alert className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md bg-yellow-50 border-yellow-200 text-yellow-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="font-poppins">
          Slow connection detected. Images and content may load slowly.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default PerformanceMonitor;
