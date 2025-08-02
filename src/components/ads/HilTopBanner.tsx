import React, { useEffect, useRef } from 'react';

interface HilTopBannerProps {
  adType?: 'leaderboard' | 'medium-rectangle' | 'sidebar' | 'mobile' | 'small-banner';
  className?: string;
  style?: React.CSSProperties;
}

const HilTopBanner: React.FC<HilTopBannerProps> = ({
  adType = 'leaderboard',
  className = '',
  style = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const getAdConfig = () => {
    switch (adType) {
      case 'medium-rectangle':
        return { width: 300, height: 250, key: '300x250' };
      case 'sidebar':
        return { width: 160, height: 600, key: '160x600' };
      case 'mobile':
        return { width: 320, height: 50, key: '320x50' };
      case 'small-banner':
        return { width: 468, height: 60, key: '468x60' };
      default:
        return { width: 728, height: 90, key: '728x90' };
    }
  };

  useEffect(() => {
    if (containerRef.current && typeof window !== 'undefined') {
      // Clear existing content
      containerRef.current.innerHTML = '';
      
      const config = getAdConfig();
      
      // Create a unique container ID for this ad
      const adContainerId = `ad-container-${Math.random().toString(36).substr(2, 9)}`;
      const adContainer = document.createElement('div');
      adContainer.id = adContainerId;
      adContainer.style.cssText = `
        width: ${config.width}px;
        height: ${config.height}px;
        border: 1px solid #e9ecef;
        border-radius: 4px;
        overflow: hidden;
      `;
      
      // Use the correct Adsteera keys for each ad size
      let adKey = '';
      switch (adType) {
        case 'medium-rectangle':
          adKey = '19504014bfa77eb1a1c95ce36b68cb2d';
          break;
        case 'sidebar':
          adKey = '5bb02b15fc62b8e72bf7b96d1dda1de7';
          break;
        case 'mobile':
          adKey = '74b4eeb76902944fd342002807fd5a4a';
          break;
        case 'small-banner':
          adKey = '9b2fde480b2294961627c49845f3e13c';
          break;
        default: // leaderboard
          adKey = '097576b5a2cc73324b0a3294b1a029f5';
          break;
      }
      
      // Try to load ad script
      try {
        // Set global options for Adsteera
        (window as any).atOptions = {
          'key': adKey,
          'format': 'iframe',
          'height': config.height,
          'width': config.width,
          'params': {}
        };
        
        // Create and load the invoke script
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
        script.setAttribute('data-cfasync', 'false');
        
        // Track if script loads successfully
        let scriptLoaded = false;
        
        script.onload = () => {
          console.log(`Adsteera script loaded for ${adKey}`);
          scriptLoaded = true;
        };
        
        script.onerror = () => {
          console.warn(`Failed to load Adsteera script for ${adKey}`);
          showFallback();
        };
        
        // Append script to head
        document.head.appendChild(script);
        
        // Show fallback if script doesn't load within 3 seconds
        setTimeout(() => {
          if (!scriptLoaded) {
            showFallback();
          }
        }, 3000);
        
      } catch (error) {
        console.error('Error loading ad script:', error);
        showFallback();
      }
      
      function showFallback() {
        if (adContainer && adContainer.children.length === 0) {
          const fallback = document.createElement('div');
          fallback.style.cssText = `
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            text-align: center;
            font-family: Arial, sans-serif;
          `;
          fallback.innerHTML = `<div>Advertisement<br>${config.key}<br><small>Adsteera Network</small></div>`;
          adContainer.appendChild(fallback);
        }
      }
      
      containerRef.current.appendChild(adContainer);
    }
  }, [adType]);

  const config = getAdConfig();

  return (
    <div 
      ref={containerRef}
      className={`hilltop-ad ${className}`}
      style={{
        width: `${config.width}px`,
        height: `${config.height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
      data-ad-type={adType}
      data-ad-size={`${config.width}x${config.height}`}
    />
  );
};

export default HilTopBanner;