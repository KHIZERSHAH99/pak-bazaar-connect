import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AdUnitProps {
  slotId: string;
  format?: 'display' | 'native' | 'video' | 'banner';
  size?: 'leaderboard' | 'medium-rectangle' | 'skyscraper' | 'mobile-banner';
  className?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({ 
  slotId, 
  format = 'display',
  size = 'medium-rectangle',
  className 
}) => {
  const adHostRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!adHostRef.current || typeof window === 'undefined') return;

    const host = adHostRef.current;
    
    // Check if iframe already exists (guard against double mounting)
    if (iframeRef.current && host.contains(iframeRef.current)) {
      return;
    }

    // Create a sandboxed iframe for the ad to isolate DOM mutations
    const iframe = document.createElement('iframe');
    iframe.setAttribute('title', `adframe-${slotId}`);
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
    iframe.style.border = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.display = 'block';
    
    // Store reference
    iframeRef.current = iframe;
    
    // Replace children of the host (not the React root)
    host.replaceChildren(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      const atOptions = {
        key: slotId,
        format,
        height: getSizeHeight(size),
        width: getSizeWidth(size),
        params: {}
      };

      doc.open();
      doc.write(`<!DOCTYPE html>
<html>
<head>
  <base target="_top" />
  <style>html,body{margin:0;padding:0;overflow:hidden;}</style>
</head>
<body>
  <div id="adsteera-${slotId}"></div>
  <script>window.atOptions = ${JSON.stringify(atOptions)};<\/script>
  <script src="//www.topcreativeformat.com/${slotId}/invoke.js" async><\/script>
</body>
</html>`);
      doc.close();

      // Hide loader after a delay
      const timer = window.setTimeout(() => setIsLoading(false), 1200);

      return () => {
        window.clearTimeout(timer);
        if (iframeRef.current) {
          try {
            // Clean up iframe
            iframeRef.current.src = 'about:blank';
            iframeRef.current.remove();
            iframeRef.current = null;
          } catch (error) {
            // Silently handle cleanup errors
          }
        }
      };
    }

    // Fallback if doc is not available
    setIsLoading(false);
  }, [slotId, format, size]);

  const getSizeWidth = (size: string): number => {
    const sizes: Record<string, number> = {
      'leaderboard': 728,
      'medium-rectangle': 300,
      'skyscraper': 160,
      'mobile-banner': 320
    };
    return sizes[size] || 300;
  };

  const getSizeHeight = (size: string): number => {
    const sizes: Record<string, number> = {
      'leaderboard': 90,
      'medium-rectangle': 250,
      'skyscraper': 600,
      'mobile-banner': 50
    };
    return sizes[size] || 250;
  };

  return (
    <div 
      className={cn(
        "ad-unit relative",
        className
      )}
      data-ad-slot={slotId}
      data-ad-format={format}
      style={{
        width: `${getSizeWidth(size)}px`,
        height: `${getSizeHeight(size)}px`,
        display: 'block'
      }}
    >
      {/* Inner host div for ad iframe - React doesn't manage its children */}
      <div 
        ref={adHostRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      />
      
      {/* Loading overlay - React manages this */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/10 rounded-lg pointer-events-none">
          <span className="text-xs text-muted-foreground">Loading ad...</span>
        </div>
      )}
    </div>
  );
};

export default AdUnit;