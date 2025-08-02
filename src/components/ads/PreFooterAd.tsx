import React from 'react';
import HilTopAd from './HilTopAd';

const PreFooterAd: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-6 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HilTopAd adType="banner" />
      </div>
    </div>
  );
};

export default PreFooterAd;