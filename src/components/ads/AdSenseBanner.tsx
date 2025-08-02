
import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    _lvyqusc?: () => void;
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
      case 'sidebar':
        return '9654495'; // Rectangle/sidebar ads
      default:
        return '9654494'; // Banner ads
    }
  };

  const getAdStyles = () => {
    switch (adType) {
      case 'rectangle':
        return { width: '300px', height: '250px', ...style };
      case 'sidebar':
        return { width: '160px', height: '600px', ...style };
      default:
        return { width: '728px', height: '90px', ...style };
    }
  };

  useEffect(() => {
    // Initialize ad when component mounts
    if (adRef.current && typeof window !== 'undefined') {
      const zoneId = getZoneId();
      
      // Create ad script element
      const script = document.createElement('script');
      script.innerHTML = `
        (function(d,z,s,c){
          s.src='//'+d+'/400/'+z;
          s.onerror=s.onload=E;
          function E(){c&&c();c=null}
          try{(document.body||document.documentElement).appendChild(s)}catch(e){E()}
        })('foomaque.net',${zoneId},document.createElement('script'),window._lvyqusc);
      `;
      
      // Append to ad container
      if (adRef.current) {
        adRef.current.appendChild(script);
      }
    }
  }, [adType]);

  return (
    <div 
      ref={adRef}
      className={`monetag-ad ${className}`} 
      style={{
        background: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '90px',
        ...getAdStyles()
      }}
      data-zone-id={getZoneId()}
    >
      <span style={{ color: '#6c757d', fontSize: '12px' }}>
        Advertisement Space
      </span>
    </div>
  );
};

export default MontagAdBanner;
