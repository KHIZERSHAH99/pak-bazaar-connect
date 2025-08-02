import React from 'react';
import UniversalHilTopBanner from './UniversalHilTopBanner';

const DesktopMultitagBanner: React.FC = () => {
  return (
    <div className="hidden md:block">
      <div className="text-xs text-gray-500 text-center mb-2">Advertisement</div>
      <UniversalHilTopBanner />
    </div>
  );
};

export default DesktopMultitagBanner;