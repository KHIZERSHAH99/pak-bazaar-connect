
import React from 'react';
import NativeAdBanner from './NativeAdBanner';

interface InContentAdBannerProps {
  className?: string;
}

const InContentAdBanner: React.FC<InContentAdBannerProps> = ({ className = '' }) => {
  return (
    <div className={`my-8 ${className}`}>
      <div className="text-xs text-gray-500 text-center mb-2">Advertisement</div>
      <div className="flex justify-center">
        <NativeAdBanner className="w-full max-w-2xl mx-auto" />
      </div>
    </div>
  );
};

export default InContentAdBanner;
