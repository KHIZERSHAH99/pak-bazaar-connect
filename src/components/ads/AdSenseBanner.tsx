
import React from 'react';

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

  return (
    <div 
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
    >
      <span style={{ color: '#6c757d', fontSize: '12px' }}>
        Advertisement Space
      </span>
    </div>
  );
};

export default MontagAdBanner;
