import React from 'react';
import AdSenseBanner from './AdSenseBanner';
const HeaderAdBanner: React.FC = () => {
  return <div className="border-b border-gray-200 py-2 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center bg-slate-900">
          <AdSenseBanner adSlot="1234567890" adFormat="horizontal" adStyle={{
          display: 'inline-block',
          width: '728px',
          height: '90px'
        }} className="hidden md:block" />
          {/* Mobile version */}
          <AdSenseBanner adSlot="1234567891" adFormat="rectangle" adStyle={{
          display: 'inline-block',
          width: '320px',
          height: '50px'
        }} className="block md:hidden" />
        </div>
      </div>
    </div>;
};
export default HeaderAdBanner;