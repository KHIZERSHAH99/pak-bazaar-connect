import React from 'react';
import UniversalHilTopBanner from './UniversalHilTopBanner';

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
  const getAdConfig = () => {
    switch (adType) {
      case 'medium-rectangle':
        return { width: 300, height: 250 };
      case 'sidebar':
        return { width: 160, height: 600 };
      case 'mobile':
        return { width: 320, height: 50 };
      case 'small-banner':
        return { width: 468, height: 60 };
      default:
        return { width: 728, height: 90 };
    }
  };

  const config = getAdConfig();

  return (
    <div 
      className={`hilltop-ad ${className}`}
      style={{
        width: `${config.width}px`,
        height: `${config.height}px`,
        ...style
      }}
      data-ad-type={adType}
      data-ad-size={`${config.width}x${config.height}`}
    >
      <UniversalHilTopBanner />
    </div>
  );
};

export default HilTopBanner;