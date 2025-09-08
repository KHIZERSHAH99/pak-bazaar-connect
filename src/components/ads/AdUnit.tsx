import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    // Load Adsteera ad unit
    if (adContainerRef.current) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        atOptions = {
          'key' : '${slotId}',
          'format' : '${format}',
          'height' : ${getSizeHeight(size)},
          'width' : ${getSizeWidth(size)},
          'params' : {}
        };
      `;
      adContainerRef.current.appendChild(script);

      const adScript = document.createElement('script');
      adScript.type = 'text/javascript';
      adScript.src = '//www.topcreativeformat.com/98a934445fa1d2aa5fd6e25b30250461/invoke.js';
      adContainerRef.current.appendChild(adScript);
    }

    return () => {
      // Cleanup
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
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
        "ad-unit flex items-center justify-center bg-muted/20 rounded-lg overflow-hidden",
        className
      )}
      data-ad-slot={slotId}
      data-ad-format={format}
    >
      <div className="text-xs text-muted-foreground">Advertisement</div>
    </div>
  );
};

export default AdUnit;