
import React from 'react';
import AdSenseBanner from './AdSenseBanner';

interface InContentAdBannerProps {
  className?: string;
}

const InContentAdBanner: React.FC<InContentAdBannerProps> = ({ className = '' }) => {
  return (
    <div className={`my-8 ${className}`}>
      <div className="text-xs text-gray-500 text-center mb-2">Advertisement</div>
      <div className="flex justify-center">
        {/* Responsive ad that works on all screen sizes */}
        <AdSenseBanner
          adSlot="9876543210"
          adFormat="auto"
          adStyle={{
            display: 'block',
            maxWidth: '100%'
          }}
          className="w-full max-w-2xl"
        />
      </div>
    </div>
  );
};

export default InContentAdBanner;
