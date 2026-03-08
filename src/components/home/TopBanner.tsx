
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag, Star } from 'lucide-react';

const TopBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="group w-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground py-3 px-2 text-center relative overflow-hidden cursor-pointer transition-all duration-200 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label="Join Now! Free Ads for First 10 Wholesalers! Click to start registration"
      onClick={() => navigate('/signup')}
      tabIndex={0}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent animate-pulse pointer-events-none"></span>
      <div className="relative flex items-center justify-center text-sm md:text-base font-poppins gap-2">
        <Flag className="w-5 h-5 mr-1 animate-bounce inline-block" aria-hidden="true" />
        <span className="font-semibold leading-tight drop-shadow-lg">
          🎉 Join Now! Free Ads for First 10 Wholesalers! Limited Time Offer
        </span>
        <Star className="w-5 h-5 ml-1 animate-spin inline-block" aria-hidden="true" />
      </div>
    </button>
  );
};

export default TopBanner;
