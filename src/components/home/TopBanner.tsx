
import React from 'react';
import { Flag, Star } from 'lucide-react';

const TopBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-pakistani_green-700 via-pakistani_green-600 to-green-600 text-white py-3 px-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
      <div className="relative flex items-center justify-center">
        <Flag className="w-5 h-5 mr-2 animate-bounce" />
        <p className="font-semibold text-sm md:text-base font-poppins">
          🎉 Join Now! Free Ads for First 10 Wholesalers! Limited Time Offer
        </p>
        <Star className="w-5 h-5 ml-2 animate-spin" />
      </div>
    </div>
  );
};

export default TopBanner;
