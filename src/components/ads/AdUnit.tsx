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
    // Load Adsteera ad unit
    if (adContainerRef.current && typeof window !== 'undefined') {
      // Clear previous content
      adContainerRef.current.innerHTML = '';
      
      // Create ad container div
      const adDiv = document.createElement('div');
      adDiv.id = `adsteera-${slotId}`;
      adContainerRef.current.appendChild(adDiv);
      
      // Set global options
      window.atOptions = {
        'key': slotId,
        'format': format,
        'height': getSizeHeight(size),
        'width': getSizeWidth(size),
        'params': {}
      };
      
      // Load the Adsteera script
      const adScript = document.createElement('script');
      adScript.type = 'text/javascript';
      adScript.src = `//www.topcreativeformat.com/${slotId}/invoke.js`;
      adScript.async = true;
      adScript.onload = () => {
        setIsLoading(false);
      };
      adScript.onerror = () => {
        console.error(`Failed to load ad: ${slotId}`);
        setIsLoading(false);
      };
      
      adContainerRef.current.appendChild(adScript);
    }

    return () => {
      // Cleanup
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
      // Set to undefined instead of deleting (avoids strict mode error)
      window.atOptions = undefined;
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