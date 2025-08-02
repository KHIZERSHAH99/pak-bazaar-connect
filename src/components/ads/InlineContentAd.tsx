import React from 'react';
import HilTopAd from './HilTopAd';

const InlineContentAd: React.FC = () => {
  return (
    <div className="my-8 py-4">
      <HilTopAd adType="banner" className="max-w-4xl mx-auto" />
    </div>
  );
};

export default InlineContentAd;