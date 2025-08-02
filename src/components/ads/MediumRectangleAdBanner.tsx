import React from 'react';
import SimpleAdBanner from './SimpleAdBanner';

const MediumRectangleAdBanner: React.FC = () => {
  return (
    <div className="flex justify-center">
      <SimpleAdBanner adType="medium-rectangle" />
    </div>
  );
};

export default MediumRectangleAdBanner;