import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, AlertCircle, CheckCircle, RefreshCw, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdDebugPanelProps {
  onClose?: () => void;
}

const AdDebugPanel: React.FC<AdDebugPanelProps> = ({ onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [adStatuses, setAdStatuses] = useState<Record<string, string>>({});
  const [networkRequests, setNetworkRequests] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    // Check all ad units on the page
    const checkAds = () => {
      const adUnits = document.querySelectorAll('[data-ad-slot]');
      const statuses: Record<string, string> = {};
      
      adUnits.forEach((unit) => {
        const slot = unit.getAttribute('data-ad-slot');
        const iframe = unit.querySelector('iframe');
        if (slot) {
          if (iframe) {
            try {
              const iframeDoc = (iframe as HTMLIFrameElement).contentDocument;
              const hasContent = iframeDoc?.body?.innerHTML && iframeDoc.body.innerHTML.length > 100;
              statuses[slot] = hasContent ? 'loaded' : 'loading';
            } catch (e) {
              statuses[slot] = 'cross-origin';
            }
          } else {
            statuses[slot] = 'no-iframe';
          }
        }
      });
      
      setAdStatuses(statuses);
    };

    // Monitor console errors
    const originalError = console.error;
    console.error = (...args) => {
      const errorMsg = args.join(' ');
      if (errorMsg.includes('ad') || errorMsg.includes('Ad') || errorMsg.includes('revenuecpmgate') || errorMsg.includes('highperformanceformat')) {
        setErrors(prev => [...prev.slice(-4), errorMsg]);
      }
      originalError.apply(console, args);
    };

    // Initial check and periodic updates
    checkAds();
    const interval = setInterval(checkAds, 2000);

    return () => {
      clearInterval(interval);
      console.error = originalError;
    };
  }, []);

  const checkNetworkRequests = () => {
    // This is a simplified check - in production you'd use Performance API
    const scripts = Array.from(document.querySelectorAll('script[src*="revenuecpmgate"], script[src*="highperformanceformat"]'));
    const requests = scripts.map(s => s.getAttribute('src') || '');
    setNetworkRequests(requests);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg"
        >
          <Bug className="w-4 h-4 mr-2" />
          Ad Debug
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-[600px] overflow-auto bg-background border-2 border-yellow-500 shadow-xl">
      <div className="p-4 border-b flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20">
        <h3 className="font-semibold flex items-center gap-2">
          <Bug className="w-5 h-5 text-yellow-600" />
          Ad Debug Panel
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsMinimized(true)}
            size="sm"
            variant="ghost"
          >
            _
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              size="sm"
              variant="ghost"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Domain Info */}
        <div>
          <p className="text-sm font-medium mb-2">Current Domain</p>
          <Badge variant={window.location.hostname === 'pakbazaarconnect.store' ? 'success' : 'secondary'}>
            {window.location.hostname}
          </Badge>
          {window.location.hostname !== 'pakbazaarconnect.store' && (
            <p className="text-xs text-yellow-600 mt-1">
              ⚠️ Ads only display on pakbazaarconnect.store
            </p>
          )}
        </div>

        {/* Ad Units Status */}
        <div>
          <p className="text-sm font-medium mb-2">Ad Units ({Object.keys(adStatuses).length})</p>
          <div className="space-y-1">
            {Object.entries(adStatuses).map(([slot, status]) => (
              <div key={slot} className="flex items-center justify-between text-xs">
                <span className="font-mono truncate max-w-[200px]">{slot}</span>
                <Badge 
                  variant={status === 'loaded' ? 'success' : status === 'loading' ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {status}
                </Badge>
              </div>
            ))}
            {Object.keys(adStatuses).length === 0 && (
              <p className="text-xs text-muted-foreground">No ad units detected</p>
            )}
          </div>
        </div>

        {/* Network Requests */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Ad Network Requests</p>
            <Button
              onClick={checkNetworkRequests}
              size="sm"
              variant="outline"
              className="h-6 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Check
            </Button>
          </div>
          <div className="space-y-1 max-h-32 overflow-auto">
            {networkRequests.map((req, i) => (
              <div key={i} className="text-xs font-mono truncate bg-muted p-1 rounded">
                {req}
              </div>
            ))}
            {networkRequests.length === 0 && (
              <p className="text-xs text-muted-foreground">Click "Check" to see requests</p>
            )}
          </div>
        </div>

        {/* Console Errors */}
        {errors.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 text-red-600">Ad-related Errors</p>
            <div className="space-y-1 max-h-32 overflow-auto">
              {errors.map((error, i) => (
                <div key={i} className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-1 rounded">
                  {error.substring(0, 100)}...
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checks */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2 text-xs">
            {window.location.protocol === 'https:' ? (
              <CheckCircle className="w-3 h-3 text-green-600" />
            ) : (
              <AlertCircle className="w-3 h-3 text-yellow-600" />
            )}
            <span>HTTPS: {window.location.protocol === 'https:' ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <AlertCircle className="w-3 h-3 text-yellow-600" />
            <span>Check browser console for ad blocker warnings</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <AlertCircle className="w-3 h-3 text-yellow-600" />
            <span>Verify Adsterra zone approval for this domain</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdDebugPanel;