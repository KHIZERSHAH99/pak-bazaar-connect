
import React from 'react';
import AdSenseBanner from './AdSenseBanner';

const SidebarAdBanner: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="text-xs text-gray-500 text-center mb-2">Advertisement</div>
      <AdSenseBanner
        adSlot="1234567892"
        adFormat="rectangle"
        adStyle={{
          display: 'block',
          width: '300px',
          height: '250px'
        }}
        className="mx-auto"
      />
    </div>
  );
};

export default SidebarAdBanner;
