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

// Allowed production hosts for ad rendering
const ALLOWED_HOSTS = ['pakbazaarconnect.store', 'www.pakbazaarconnect.store'];
const isProductionDomain = () => typeof window !== 'undefined' && ALLOWED_HOSTS.includes(window.location.hostname);

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
  const [disabledByDomain, setDisabledByDomain] = useState(false);

  useEffect(() => {
    if (!adHostRef.current || typeof document === 'undefined') return;

    const host = adHostRef.current;
    const resolvedSlot = resolveSlot(slotId, size);

    // Only render ads on production domain
    if (!isProductionDomain()) {
      setDisabledByDomain(true);
      setIsLoading(false);
      if (process.env.NODE_ENV === 'development') {
        console.debug('[AdUnit] Ad disabled on non-production domain', window.location.hostname);
      }
      return;
    } else {
      setDisabledByDomain(false);
    }

    // Reset host
    host.innerHTML = '';
    setIsLoading(true);

    // Create a local container so the network script writes in-place
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    host.appendChild(container);

    // Inline script to set atOptions right before loading the network script
    const optionsScript = document.createElement('script');
    optionsScript.type = 'text/javascript';
    optionsScript.text = `window.atOptions = ${JSON.stringify({
      key: resolvedSlot,
      format: 'iframe',
      height: getSizeHeight(size),
      width: getSizeWidth(size),
      params: {}
    })};`;

    // Network loader script (use the latest Adsterra domain)
    const loaderScript = document.createElement('script');
    loaderScript.src = `//www.topcreativeformat.com/${resolvedSlot}/invoke.js`;
    loaderScript.async = true;

    container.appendChild(optionsScript);
    container.appendChild(loaderScript);

    // Hide loader when ad DOM appears or after timeout
    const checkInterval = window.setInterval(() => {
      const hasAd = container.querySelector('iframe, ins, a, img');
      if (hasAd) {
        setIsLoading(false);
        window.clearInterval(checkInterval);
      }
    }, 300);

    const failTimer = window.setTimeout(() => {
      setIsLoading(false);
      window.clearInterval(checkInterval);
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[AdUnit] Ad may not have loaded for slot ${resolvedSlot} on ${window.location.hostname}`);
      }
    }, 5000);

    return () => {
      window.clearInterval(checkInterval);
      window.clearTimeout(failTimer);
      try {
        host.innerHTML = '';
      } catch {}
    };
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
      
      {/* Loading/disabled overlays */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/10 rounded-lg pointer-events-none">
          <span className="text-xs text-muted-foreground">Loading ad...</span>
        </div>
      )}
      {disabledByDomain && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg pointer-events-none">
          <span className="text-xs text-muted-foreground">Ad will appear on pakbazaarconnect.store</span>
        </div>
      )}
    </div>
  );
};

export default AdUnit;