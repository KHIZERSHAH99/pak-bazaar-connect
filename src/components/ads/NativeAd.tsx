import React from 'react';
import AdBanner from './AdBanner';

const NativeAd: React.FC = () => {
  return (
    <div className="w-full py-4">
      <p className="text-xs text-muted-foreground mb-2 text-center">Sponsored</p>
      <AdBanner size="native" className="min-h-[100px]" />
    </div>
  );
};

export default NativeAd;
