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
    let adContainer: HTMLDivElement | null = null;
    let adScript: HTMLScriptElement | null = null;
    
    // Load Adsteera ad unit
    if (adContainerRef.current && typeof window !== 'undefined') {
      const parentElement = adContainerRef.current;
      
      // Create a new container for the ad
      adContainer = document.createElement('div');
      adContainer.id = `adsteera-container-${slotId}`;
      
      // Create ad div
      const adDiv = document.createElement('div');
      adDiv.id = `adsteera-${slotId}`;
      adContainer.appendChild(adDiv);
      
      // Set global options
      window.atOptions = {
        'key': slotId,
        'format': format,
        'height': getSizeHeight(size),
        'width': getSizeWidth(size),
        'params': {}
      };
      
      // Create and load the Adsteera script
      adScript = document.createElement('script');
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
      
      adContainer.appendChild(adScript);
      
      // Clear existing content and add new container
      while (parentElement.firstChild) {
        parentElement.removeChild(parentElement.firstChild);
      }
      parentElement.appendChild(adContainer);
    }

    return () => {
      // Safer cleanup
      try {
        if (adContainerRef.current) {
          // Remove children one by one to avoid React issues
          const parent = adContainerRef.current;
          while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
          }
        }
        
        // Clean up global options
        window.atOptions = undefined;
      } catch (error) {
        console.warn('AdUnit cleanup error:', error);
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