import React from 'react';
import SimpleAdBanner from './SimpleAdBanner';

const MobileBannerAd: React.FC = () => {
  return (
    <div className="flex justify-center md:hidden">
      <SimpleAdBanner adType="mobile" />
    </div>
  );
};

export default MobileBannerAd;