import React from 'react';
import HilTopBanner from './HilTopBanner';

const SidebarRectangleAd: React.FC = () => {
  return (
    <div className="hidden lg:block">
      <div className="text-xs text-gray-500 text-center mb-2">Advertisement</div>
      <div className="flex justify-center">
        <HilTopBanner adType="sidebar" />
      </div>
    </div>
  );
};

export default SidebarRectangleAd;