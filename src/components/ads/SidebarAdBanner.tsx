
import React from 'react';
import AdsteeraBanner from './AdsteeraBanner';

const SidebarAdBanner: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="text-xs text-gray-500 text-center mb-2">Advertisement</div>
      <AdsteeraBanner
        zoneId="sidebar-rect"
        adType="rectangle"
        className="mx-auto"
      />
    </div>
  );
};

export default SidebarAdBanner;
