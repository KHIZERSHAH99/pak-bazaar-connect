import React from 'react';
import AdBanner from './AdBanner';

interface SidebarAdProps {
  position?: 'left' | 'right';
}

const SidebarAd: React.FC<SidebarAdProps> = ({ position = 'right' }) => {
  return (
    <div className={`hidden xl:block fixed ${position === 'left' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 z-40`}>
      <div className="space-y-4">
        <AdBanner size="160x300" />
      </div>
    </div>
  );
};

export default SidebarAd;
