import React from 'react';
import DesktopMultitagBanner from './DesktopMultitagBanner';
import MobileMultitagBanner from './MobileMultitagBanner';
import LeaderboardAdBanner from './LeaderboardAdBanner';

const FooterAdBanner: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-4 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-xs text-gray-500 text-center mb-2">Advertisement</div>
        
        {/* Desktop Layout */}
        <div className="hidden md:block space-y-4">
          <LeaderboardAdBanner />
          <DesktopMultitagBanner />
        </div>
        
        {/* Mobile Layout */}
        <div className="block md:hidden space-y-4">
          <MobileMultitagBanner />
        </div>
      </div>
    </div>
  );
};

export default FooterAdBanner;