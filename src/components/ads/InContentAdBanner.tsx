
import React from 'react';
import AdsteeraBanner from './AdsteeraBanner';

interface InContentAdBannerProps {
  className?: string;
}

const InContentAdBanner: React.FC<InContentAdBannerProps> = ({ className = '' }) => {
  return (
    <div className={`my-8 ${className}`}>
      <div className="text-xs text-gray-500 text-center mb-2">Advertisement</div>
      <div className="flex justify-center">
        {/* Responsive ad that works on all screen sizes */}
        <AdsteeraBanner
          zoneId="5186568"
          adType="banner"
          className="w-full max-w-2xl mx-auto"
        />
      </div>
    </div>
  );
};

export default InContentAdBanner;
