
import React from 'react';
import { Ad } from '@/lib/ads';
import EnhancedAdCard from '@/components/ads/EnhancedAdCard';

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
        <EnhancedAdCard 
          key={ad.id} 
          ad={ad}
          onPause={onPause}
          onResume={onResume}
          onViewAnalytics={onViewAnalytics}
        />
      ))}
    </div>
  );
};

export default AdsGrid;
