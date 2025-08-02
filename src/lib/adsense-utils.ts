import React from 'react';

// Utility functions for Monetag management
export const MontagUtils = {
  // Check if Monetag is initialized
  isMontagLoaded: (): boolean => {
    return typeof window !== 'undefined' && !!document.querySelector('meta[name="monetag"]');
  },

  // Get Monetag status
  getMontagStatus: () => {
    if (typeof window === 'undefined') return 'server-side';
    
    const meta = document.querySelector('meta[name="monetag"]');
    if (!meta) return 'not-loaded';
    
    return 'loaded';
  },

  // Debug Monetag ads on page
  debugAds: () => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return;
    }

    console.group('🔍 Monetag Debug Info');
    console.log('Monetag Status:', MontagUtils.getMontagStatus());
    
    const ads = document.querySelectorAll('.monetag-ad');
    console.log(`Found ${ads.length} ad containers on page:`);
    
    ads.forEach((ad, index) => {
      console.log(`Ad ${index + 1}: Type=${ad.className}`);
    });
    
    console.groupEnd();
  },

  isLoaded: () => {
    return MontagUtils.isMontagLoaded();
  }
};

// Hook for using Monetag in React components
export const useMontag = () => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const checkMontag = () => {
      setIsLoaded(MontagUtils.isLoaded());
    };

    // Check immediately
    checkMontag();

    // Also check after a delay
    const timer = setTimeout(checkMontag, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    isLoaded,
    status: MontagUtils.getMontagStatus(),
    debug: MontagUtils.debugAds
  };
};
