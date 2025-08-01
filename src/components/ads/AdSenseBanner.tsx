
import React, { useEffect, useRef } from 'react';

// Extend Window interface for Monetag functions
declare global {
  interface Window {
    _bqykifko?: () => void;
    _jdkkg?: () => void;
  }
}

interface MontagAdBannerProps {
  adType?: 'banner' | 'rectangle' | 'sidebar';
  className?: string;
  style?: React.CSSProperties;
}

const MontagAdBanner: React.FC<MontagAdBannerProps> = ({
  adType = 'banner',
  className = '',
  style = {}
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  const getZoneId = () => {
    switch (adType) {
      case 'rectangle':
        return '9654320'; // Rectangle/square ads
      case 'sidebar':
        return '9654319'; // Sidebar ads  
      default:
        return '9654319'; // Banner ads
    }
  };

  const getAdStyles = () => {
    switch (adType) {
      case 'rectangle':
        return { width: '300px', height: '250px', minHeight: '250px', ...style };
      case 'sidebar':
        return { width: '160px', height: '600px', minHeight: '600px', ...style };
      default:
        return { width: '100%', maxWidth: '728px', height: '90px', minHeight: '90px', ...style };
    }
  };

  useEffect(() => {
    const loadMontagAd = () => {
      if (!adRef.current) return;

      // Create script element for this specific ad
      const script = document.createElement('script');
      script.src = '//madurird.com/tag.min.js';
      script.setAttribute('data-zone', getZoneId());
      script.setAttribute('data-cfasync', 'false');
      script.async = true;
      
      // Add error and load handlers
      script.onerror = () => {
        if (typeof window._bqykifko === 'function') {
          window._bqykifko();
        }
      };
      
      script.onload = () => {
        if (typeof window._jdkkg === 'function') {
          window._jdkkg();
        }
      };

      // Append to the ad container
      adRef.current.appendChild(script);
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(loadMontagAd, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div 
      ref={adRef}
      className={`monetag-ad ${className}`} 
      style={{
        display: 'block',
        textAlign: 'center',
        ...getAdStyles()
      }}
      data-zone={getZoneId()}
    />
  );
};

export default MontagAdBanner;
