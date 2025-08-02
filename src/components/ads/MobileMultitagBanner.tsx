import React from 'react';
import UniversalHilTopBanner from './UniversalHilTopBanner';

const MobileMultitagBanner: React.FC = () => {
  return (
    <div className="block md:hidden">
      <div className="text-xs text-gray-500 text-center mb-2">Advertisement</div>
      <UniversalHilTopBanner />
    </div>
  );
};

export default MobileMultitagBanner;