import React from 'react';
import LeaderboardAdBanner from './LeaderboardAdBanner';
import MobileBannerAd from './MobileBannerAd';
import MobileMultitagBanner from './MobileMultitagBanner';

const HeaderAdBanner: React.FC = () => {
  return (
    <div className="border-b border-gray-200 py-2 bg-[#f6fdf8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-xs text-gray-500 text-center mb-2">Advertisement</div>
        <div className="hidden md:block">
          <LeaderboardAdBanner />
        </div>
        <div className="block md:hidden space-y-2">
          <MobileBannerAd />
          <MobileMultitagBanner />
        </div>
      </div>
    </div>
  );
};
export default HeaderAdBanner;