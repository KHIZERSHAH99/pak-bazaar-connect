import React from 'react';
import NativeAdBanner from './NativeAdBanner';
const HeaderAdBanner: React.FC = () => {
  return <div className="border-b border-gray-200 py-2 bg-[#f6fdf8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center bg-green-800 rounded-3xl">
          <NativeAdBanner className="w-full max-w-2xl" />
        </div>
      </div>
    </div>;
};
export default HeaderAdBanner;