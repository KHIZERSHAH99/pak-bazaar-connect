
import React from 'react';
import MediumRectangleAdBanner from './MediumRectangleAdBanner';

interface InContentAdBannerProps {
  className?: string;
}

const InContentAdBanner: React.FC<InContentAdBannerProps> = ({ className = '' }) => {
  return (
    <div className={`my-6 ${className} hidden md:block`}>
      <div className="text-xs text-gray-500 text-center mb-2">Advertisement</div>
      <div className="flex justify-center">
        <MediumRectangleAdBanner />
      </div>
    </div>
  );
};

export default InContentAdBanner;
