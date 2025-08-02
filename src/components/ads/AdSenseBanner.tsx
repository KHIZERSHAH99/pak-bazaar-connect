
import React from 'react';
import HilTopBanner from './HilTopBanner';

interface HilTopAdBannerProps {
  adType?: 'banner' | 'rectangle' | 'sidebar';
  className?: string;
  style?: React.CSSProperties;
}

const HilTopAdBanner: React.FC<HilTopAdBannerProps> = ({
  adType = 'banner',
  className = '',
  style = {}
}) => {
  const getHilTopAdType = () => {
    switch (adType) {
      case 'rectangle':
        return 'medium-rectangle';
      case 'sidebar':
        return 'sidebar';
      default:
        return 'leaderboard';
    }
  };

  return (
    <div className={className} style={style}>
      <HilTopBanner adType={getHilTopAdType()} />
    </div>
  );
};

export default HilTopAdBanner;
