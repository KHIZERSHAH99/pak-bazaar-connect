
import React from 'react';
import MediumRectangleAdBanner from './MediumRectangleAdBanner';

interface InContentAdBannerProps {
  className?: string;
}

const InContentAdBanner: React.FC<InContentAdBannerProps> = ({ className = '' }) => {
  return (
    <div className={`my-8 ${className}`}>
      <div className="text-xs text-gray-500 text-center mb-2">Advertisement</div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center max-w-6xl mx-auto">
        <MediumRectangleAdBanner />
        <MediumRectangleAdBanner />
        <MediumRectangleAdBanner />
        <MediumRectangleAdBanner />
      </div>
    </div>
  );
};

export default InContentAdBanner;
