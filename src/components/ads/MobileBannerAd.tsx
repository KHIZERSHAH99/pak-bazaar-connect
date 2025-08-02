import React from 'react';
import HilTopBanner from './HilTopBanner';

const MobileBannerAd: React.FC = () => {
  return (
    <div className="flex justify-center md:hidden">
      <HilTopBanner adType="mobile" />
    </div>
  );
};

export default MobileBannerAd;