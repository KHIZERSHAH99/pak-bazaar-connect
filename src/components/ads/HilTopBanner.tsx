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
      
      // Create container for the ad
      const adContainer = document.createElement('div');
      adContainer.style.cssText = `
        width: ${config.width}px;
        height: ${config.height}px;
        overflow: hidden;
        position: relative;
      `;
      
      // Set up Adsteera ad options
      const optionsScript = document.createElement('script');
      optionsScript.type = 'text/javascript';
      optionsScript.innerHTML = `
        atOptions = {
          'key' : '${adKey}',
          'format' : 'iframe',
          'height' : ${config.height},
          'width' : ${config.width},
          'params' : {}
        };
      `;
      
      // Create the invoke script
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.async = true;
      invokeScript.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
      invokeScript.setAttribute('data-cfasync', 'false');
      
      // Add scripts to the container
      adContainer.appendChild(optionsScript);
      adContainer.appendChild(invokeScript);
      
      containerRef.current.appendChild(adContainer);
      
      // Force ad to load by creating iframe manually if needed
      setTimeout(() => {
        if (adContainer.children.length <= 2) {
          const iframe = document.createElement('iframe');
          iframe.src = `//www.highperformanceformat.com/${adKey}/iframe.html`;
          iframe.style.cssText = `
            width: ${config.width}px;
            height: ${config.height}px;
            border: none;
            overflow: hidden;
          `;
          iframe.setAttribute('frameborder', '0');
          iframe.setAttribute('scrolling', 'no');
          adContainer.appendChild(iframe);
        }
      }, 2000);
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