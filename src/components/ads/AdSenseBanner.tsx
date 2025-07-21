
import React, { useEffect, useRef } from 'react';

interface AdSenseBannerProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  adStyle?: React.CSSProperties;
  className?: string;
}

const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  adSlot,
  adFormat = 'auto',
  adStyle = { display: 'block' },
  className = ''
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const adInitialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (adInitialized.current) return;

    const initializeAd = () => {
      try {
        // Check if adsbygoogle is available and the ad element exists
        if (
          typeof window !== 'undefined' && 
          (window as any).adsbygoogle && 
          adRef.current &&
          adRef.current.querySelector('.adsbygoogle')
        ) {
          console.log(`Initializing AdSense ad for slot: ${adSlot}`);
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          adInitialized.current = true;
        }
      } catch (error) {
        console.error('AdSense initialization error for slot', adSlot, ':', error);
      }
    };

    // Wait a bit for the DOM to be ready
    const timer = setTimeout(initializeAd, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [adSlot]);

  return (
    <div className={`adsense-container ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-6598242635867029"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
        data-ad-test={process.env.NODE_ENV === 'development' ? 'on' : undefined}
      />
    </div>
  );
};

export default AdSenseBanner;
