import React from 'react';
import HilTopBanner from './HilTopBanner';

interface NativeAdBannerProps {
  className?: string;
  style?: React.CSSProperties;
}

const NativeAdBanner: React.FC<NativeAdBannerProps> = ({ 
  className = '', 
  style = {} 
}) => {
  return (
    <div className={className} style={style}>
      <HilTopBanner adType="medium-rectangle" />
    </div>
  );
};

export default NativeAdBanner;