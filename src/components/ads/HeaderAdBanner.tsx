
import React from 'react';
import AdsteeraBanner from './AdsteeraBanner';
import MontagAdBanner from './AdSenseBanner';

const HeaderAdBanner: React.FC = () => {
  return (
    <div className="border-b border-gray-200 py-2 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          {/* Adsteera Banner Ad */}
          <AdsteeraBanner 
            zoneId="header-banner"
            adType="banner"
            className="hidden md:block" 
          />
          
          {/* Mobile Banner Ad */}
          <AdsteeraBanner 
            zoneId="header-mobile"
            adType="banner"
            style={{ width: '320px', height: '50px' }}
            className="block md:hidden" 
          />
        </div>
      </div>
    </div>
  );
};

export default HeaderAdBanner;
