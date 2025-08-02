
import React from 'react';
import MediumRectangleAdBanner from './MediumRectangleAdBanner';
import DesktopMultitagBanner from './DesktopMultitagBanner';
import MobileMultitagBanner from './MobileMultitagBanner';

interface InContentAdBannerProps {
  className?: string;
}

const InContentAdBanner: React.FC<InContentAdBannerProps> = ({ className = '' }) => {
  return (
    <div className={`my-8 ${className}`}>
      <div className="text-xs text-gray-500 text-center mb-2">Advertisement</div>
      
      {/* Desktop: Grid of 4 rectangle ads + multitag */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center max-w-6xl mx-auto mb-4">
          <MediumRectangleAdBanner />
          <MediumRectangleAdBanner />
          <MediumRectangleAdBanner />
          <MediumRectangleAdBanner />
        </div>
        <DesktopMultitagBanner />
      </div>
      
      {/* Mobile: Single rectangle ad + mobile multitag */}
      <div className="block md:hidden space-y-4">
        <MediumRectangleAdBanner />
        <MobileMultitagBanner />
      </div>
    </div>
  );
};

export default InContentAdBanner;
