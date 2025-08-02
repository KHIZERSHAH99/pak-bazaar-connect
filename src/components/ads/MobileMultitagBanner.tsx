import React from 'react';
import MultitagBanner from './MultitagBanner';

const MobileMultitagBanner: React.FC = () => {
  return (
    <div className="block md:hidden">
      <div className="text-xs text-gray-500 text-center mb-2">Advertisement</div>
      <MultitagBanner device="mobile" />
    </div>
  );
};

export default MobileMultitagBanner;