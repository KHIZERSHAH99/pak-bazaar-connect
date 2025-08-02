import React, { useEffect, useRef } from 'react';

interface SimpleAdBannerProps {
  adType?: 'leaderboard' | 'medium-rectangle' | 'sidebar' | 'mobile' | 'small-banner';
  className?: string;
  style?: React.CSSProperties;
}

const SimpleAdBanner: React.FC<SimpleAdBannerProps> = ({
  adType = 'leaderboard',
  className = '',
  style = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const getAdConfig = () => {
    switch (adType) {
      case 'medium-rectangle':
        return { width: 300, height: 250, key: '300x250', label: 'Medium Rectangle' };
      case 'sidebar':
        return { width: 160, height: 600, key: '160x600', label: 'Sidebar' };
      case 'mobile':
        return { width: 320, height: 50, key: '320x50', label: 'Mobile Banner' };
      case 'small-banner':
        return { width: 468, height: 60, key: '468x60', label: 'Small Banner' };
      default:
        return { width: 728, height: 90, key: '728x90', label: 'Leaderboard' };
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const config = getAdConfig();
      
      // Create ad content directly without external scripts
      const adElement = document.createElement('div');
      adElement.style.cssText = `
        width: ${config.width}px;
        height: ${config.height}px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: transform 0.2s ease;
      `;
      
      adElement.innerHTML = `
        <div style="text-align: center; padding: 10px;">
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">
            Advertisement
          </div>
          <div style="font-size: 11px; opacity: 0.9;">
            ${config.label} • ${config.key}
          </div>
          <div style="font-size: 10px; opacity: 0.7; margin-top: 5px;">
            HilTop Network
          </div>
        </div>
      `;
      
      // Add hover effect
      adElement.onmouseenter = () => {
        adElement.style.transform = 'translateY(-2px)';
        adElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
      };
      
      adElement.onmouseleave = () => {
        adElement.style.transform = 'translateY(0)';
        adElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      };
      
      // Add click handler
      adElement.onclick = () => {
        console.log(`Ad clicked: ${config.label} - ${config.key}`);
        // In real implementation, this would redirect to advertiser's page
      };
      
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(adElement);
    }
  }, [adType]);

  const config = getAdConfig();

  return (
    <div 
      ref={containerRef}
      className={`simple-ad-banner ${className}`}
      style={{
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

export default SimpleAdBanner;