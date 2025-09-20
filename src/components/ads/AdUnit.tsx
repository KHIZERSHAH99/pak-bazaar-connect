import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    atOptions?: any;
  }
}

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
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!adContainerRef.current || typeof window === 'undefined') return;

    const parent = adContainerRef.current;

    // Create a sandboxed iframe for the ad to isolate DOM mutations
    const iframe = document.createElement('iframe');
    iframe.setAttribute('title', `adframe-${slotId}`);
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    iframe.style.border = '0';
    iframe.style.width = `${getSizeWidth(size)}px`;
    iframe.style.height = `${getSizeHeight(size)}px`;

    // Clear and append iframe once
    parent.textContent = '';
    parent.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      const atOptions = {
        key: slotId,
        format,
        height: getSizeHeight(size),
        width: getSizeWidth(size),
        params: {}
      } as any;

      doc.open();
      doc.write(`<!DOCTYPE html><html><head><base target="_top" /><style>html,body{margin:0;padding:0;}</style></head><body><div id="adsteera-${slotId}"></div><script>window.atOptions = ${JSON.stringify(atOptions)};<\/script><script src="//www.topcreativeformat.com/${slotId}/invoke.js" async><\/script></body></html>`);
      doc.close();

      // We can't always detect load reliably; hide loader after a short delay
      const t = window.setTimeout(() => setIsLoading(false), 1200);

      return () => {
        window.clearTimeout(t);
        try {
          // Reset iframe instead of manipulating DOM children to avoid NotFoundError
          iframe.src = 'about:blank';
          iframe.remove();
        } catch (error) {
          // no-op
        }
      };
    }

    // Fallback if doc is not available
    setIsLoading(false);

    return () => {
      try {
        parent.textContent = '';
      } catch (error) {
        // no-op
      }
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
      ref={adContainerRef}
      className={cn(
        "ad-unit relative min-h-[50px]",
        size === 'leaderboard' && 'min-h-[90px]',
        size === 'medium-rectangle' && 'min-h-[250px]',
        size === 'skyscraper' && 'min-h-[600px]',
        size === 'mobile-banner' && 'min-h-[50px]',
        className
      )}
      data-ad-slot={slotId}
      data-ad-format={format}
      style={{
        minWidth: `${getSizeWidth(size)}px`,
        display: 'block'
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/10 rounded-lg">
          <span className="text-xs text-muted-foreground">Loading ad...</span>
        </div>
      )}
    </div>
  );
};

export default AdUnit;