
import React from 'react';
import { Ad } from '@/lib/ads';


interface AdsGridProps {
  ads: Ad[];
  onPause: (adId: string) => void;
  onResume: (adId: string) => void;
  onViewAnalytics: (adId: string) => void;
}

const AdsGrid: React.FC<AdsGridProps> = ({ ads, onPause, onResume, onViewAnalytics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ads.map((ad) => (
        <div key={ad.id} className="p-4 border rounded-lg bg-white">
          <h3 className="font-semibold">{ad.headline}</h3>
          <p className="text-sm text-gray-600">Status: {ad.status}</p>
          {/* Ad cards will be restored after AdSense approval */}
        </div>
      ))}
    </div>
  );
};

export default AdsGrid;
