
import React from 'react';
import NativeAdBanner from './NativeAdBanner';

const HeaderAdBanner: React.FC = () => {
  return (
    <div className="border-b border-gray-200 py-2 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <NativeAdBanner className="w-full max-w-2xl" />
        </div>
      </div>
    </div>
  );
};

export default HeaderAdBanner;
