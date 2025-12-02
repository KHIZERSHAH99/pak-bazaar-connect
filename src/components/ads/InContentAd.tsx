import React from 'react';
import AdBanner from './AdBanner';

interface InContentAdProps {
  variant?: 'horizontal' | 'square' | 'mobile';
}

const InContentAd: React.FC<InContentAdProps> = ({ variant = 'horizontal' }) => {
  return (
    <div className="w-full flex justify-center py-6">
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-2">Advertisement</p>
        {variant === 'horizontal' && (
          <>
            {/* Desktop: Wide banner */}
            <div className="hidden md:block">
              <AdBanner size="728x90" />
            </div>
            {/* Mobile: Mobile banner */}
            <div className="block md:hidden">
              <AdBanner size="320x50" />
            </div>
          </>
        )}
        {variant === 'square' && (
          <AdBanner size="300x250" />
        )}
        {variant === 'mobile' && (
          <AdBanner size="320x50" />
        )}
      </div>
    </div>
  );
};

export default InContentAd;
