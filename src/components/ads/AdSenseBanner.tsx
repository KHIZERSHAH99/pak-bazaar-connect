
import React from 'react';

interface AdBannerProps {
  adType?: 'banner' | 'rectangle' | 'sidebar';
  className?: string;
  style?: React.CSSProperties;
}

const AdBanner: React.FC<AdBannerProps> = ({
  adType = 'banner',
  className = '',
  style = {}
}) => {
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

  return (
    <div 
      className={`ad-banner ${className}`} 
      style={{
        backgroundColor: 'hsl(var(--muted))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'hsl(var(--muted-foreground))',
        fontSize: '14px',
        ...getAdStyles()
      }}
    >
      Advertisement Space
    </div>
  );
};

export default AdBanner;
