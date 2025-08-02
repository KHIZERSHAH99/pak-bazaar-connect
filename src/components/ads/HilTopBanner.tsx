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
      
      // Create HilTop ad script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        (function() {
          var hilTop = document.createElement('div');
          hilTop.style.width = '${config.width}px';
          hilTop.style.height = '${config.height}px';
          hilTop.style.backgroundColor = '#f8f9fa';
          hilTop.style.border = '1px solid #e9ecef';
          hilTop.style.borderRadius = '4px';
          hilTop.style.display = 'flex';
          hilTop.style.alignItems = 'center';
          hilTop.style.justifyContent = 'center';
          hilTop.style.fontSize = '12px';
          hilTop.style.color = '#6c757d';
          hilTop.innerHTML = 'HilTop Advertisement ${config.key}';
          
          // Simulate ad loading
          setTimeout(function() {
            try {
              var adContent = document.createElement('iframe');
              adContent.src = 'about:blank';
              adContent.style.width = '100%';
              adContent.style.height = '100%';
              adContent.style.border = 'none';
              adContent.onload = function() {
                try {
                  this.contentDocument.body.innerHTML = 
                    '<div style="background: linear-gradient(45deg, #4CAF50, #81C784); color: white; height: 100%; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif; font-size: 14px; text-align: center;">' +
                    '<div>HilTop Ad<br>${config.key}</div>' +
                    '</div>';
                } catch(e) {
                  console.log('HilTop ad content security restricted');
                }
              };
              hilTop.innerHTML = '';
              hilTop.appendChild(adContent);
            } catch(e) {
              console.log('HilTop ad loading error:', e);
            }
          }, Math.random() * 1000 + 500);
          
          return hilTop;
        })()
      `;
      
      // Execute the script and append the result
      try {
        const adElement = eval('(' + script.innerHTML + ')');
        containerRef.current.appendChild(adElement);
      } catch (error) {
        console.error('HilTop ad loading error:', error);
        // Fallback display
        const fallback = document.createElement('div');
        const config = getAdConfig();
        fallback.style.cssText = `
          width: ${config.width}px;
          height: ${config.height}px;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #6c757d;
        `;
        fallback.textContent = `HilTop Advertisement ${config.key}`;
        containerRef.current.appendChild(fallback);
      }
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