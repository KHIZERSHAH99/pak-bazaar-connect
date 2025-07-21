
import React from 'react';
import AdSenseBanner from './AdSenseBanner';

const HeaderAdBanner: React.FC = () => {
  return (
    <div className="border-b border-gray-200 py-2 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          {/* Desktop Leaderboard Ad (728x90) */}
          <AdSenseBanner 
            adSlot="3847291065" 
            adFormat="horizontal" 
            adStyle={{
              display: 'inline-block',
              width: '728px',
              height: '90px'
            }} 
            className="hidden md:block" 
          />
          
          {/* Mobile Banner Ad (320x50) */}
          <AdSenseBanner 
            adSlot="8573194267" 
            adFormat="horizontal" 
            adStyle={{
              display: 'inline-block',
              width: '320px',
              height: '50px'
            }} 
            className="block md:hidden" 
          />
        </div>
      </div>
    </div>
  );
};

export default HeaderAdBanner;
