import React from 'react';
import MultitagBanner from './MultitagBanner';

const DesktopMultitagBanner: React.FC = () => {
  return (
    <div className="hidden md:block">
      <div className="text-xs text-gray-500 text-center mb-2">Advertisement</div>
      <MultitagBanner device="desktop" />
    </div>
  );
};

export default DesktopMultitagBanner;