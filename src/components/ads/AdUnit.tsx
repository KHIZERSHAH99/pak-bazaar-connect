import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// Adsterra slot keys for different banner sizes
const ADSTERRA_SLOTS = {
  BANNER_728x90: '987a9a316732abab62bdd80e2baaaa93',
  BANNER_300x250: '6e906f54278379013dea325356cedfea',
  BANNER_160x600: 'e30a2bc2dccbb1f927dfa1de88c6da80',
  BANNER_160x300: 'a6eb4fc26806968df42c310267719019',
  BANNER_468x60: '4ca53a30c3288ee4c14365b01965f143',
  BANNER_320x50: '9417818636aacc88f0c4b1dee7ca88c4',
  NATIVE: 'e38f7b8d13d3c6ad12cd625c9c483842'
};

// Map placement names to appropriate banner sizes
const PLACEMENT_MAPPING: Record<string, string> = {
  'homepage-top': ADSTERRA_SLOTS.BANNER_728x90,
  'homepage-middle': ADSTERRA_SLOTS.BANNER_728x90,
  'homepage-bottom': ADSTERRA_SLOTS.BANNER_728x90,
  'products-top': ADSTERRA_SLOTS.BANNER_300x250,
  'grid': ADSTERRA_SLOTS.BANNER_300x250,
  'sticky': ADSTERRA_SLOTS.BANNER_160x600,
  'mobile-banner': ADSTERRA_SLOTS.BANNER_320x50,
};

const resolveSlot = (id: string, size?: string) => {
  // Check if it's a direct slot key
  if (Object.values(ADSTERRA_SLOTS).includes(id)) {
    return id;
  }
  
  // Check if it's a placement name
  if (PLACEMENT_MAPPING[id]) {
    return PLACEMENT_MAPPING[id];
  }
  
  // Map based on size if provided
  if (size) {
    switch (size) {
      case 'leaderboard':
        return ADSTERRA_SLOTS.BANNER_728x90;
      case 'medium-rectangle':
        return ADSTERRA_SLOTS.BANNER_300x250;
      case 'skyscraper':
        return ADSTERRA_SLOTS.BANNER_160x600;
      case 'mobile-banner':
        return ADSTERRA_SLOTS.BANNER_320x50;
      default:
        return ADSTERRA_SLOTS.BANNER_300x250;
    }
  }
  
  // Default fallback
  return ADSTERRA_SLOTS.BANNER_300x250;
};

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
    const resolvedSlot = resolveSlot(slotId, size);
    
    // Check if iframe already exists (guard against double mounting)
    if (iframeRef.current && host.contains(iframeRef.current)) {
      return;
    }
    
    // Check if we should use native format
    const isNative = format === 'native' && resolvedSlot === ADSTERRA_SLOTS.NATIVE;

    // Create a sandboxed iframe for the ad to isolate DOM mutations
    const iframe = document.createElement('iframe');
    iframe.setAttribute('title', `adframe-${resolvedSlot}`);
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation');
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
      if (isNative) {
        // Native banner format
        doc.open();
        doc.write(`<!DOCTYPE html>
<html>
<head>
  <base target="_top" />
  <style>html,body{margin:0;padding:0;overflow:hidden;}</style>
</head>
<body>
  <script async="async" data-cfasync="false" src="//pl27701721.revenuecpmgate.com/${resolvedSlot}/invoke.js"><\/script>
  <div id="container-${resolvedSlot}"></div>
</body>
</html>`);
        doc.close();
      } else {
        // Standard iframe format
        const atOptions = {
          key: resolvedSlot,
          format: 'iframe', // Always use iframe format as per Adsterra docs
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
  <script>window.atOptions = ${JSON.stringify(atOptions)};<\/script>
  <script src="//www.highperformanceformat.com/${resolvedSlot}/invoke.js" async><\/script>
</body>
</html>`);
        doc.close();
      }

      // Hide loader after a delay
      const timer = window.setTimeout(() => {
        setIsLoading(false);
        
        // Development warning if ad doesn't load
        if (process.env.NODE_ENV === 'development') {
          const checkTimer = window.setTimeout(() => {
            const iframeDoc = iframeRef.current?.contentDocument;
            if (iframeDoc && !iframeDoc.querySelector('ins, iframe, div[id*="container"]')) {
              console.warn(`Ad unit ${resolvedSlot} may not have loaded. Check ad blocker or network.`);
            }
          }, 3000);
          
          return () => window.clearTimeout(checkTimer);
        }
      }, 1200);

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