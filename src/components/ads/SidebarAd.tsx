import React from 'react';
import HilTopAd from './HilTopAd';

const SidebarAd: React.FC = () => {
  return (
    <div className="hidden lg:block bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <HilTopAd adType="rectangle" />
    </div>
  );
};

export default SidebarAd;