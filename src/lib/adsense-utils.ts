import React from 'react';

// Utility functions for AdSense management
export const AdSenseUtils = {
  // Check if AdSense script is loaded
  isAdSenseLoaded: (): boolean => {
    return typeof window !== 'undefined' && !!(window as any).adsbygoogle;
  },

  // Get AdSense loading status
  getAdSenseStatus: () => {
    if (typeof window === 'undefined') return 'server-side';
    
    const script = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
    if (!script) return 'not-loaded';
    
    if ((window as any).adsbygoogle) return 'loaded';
    
    return 'loading';
  },

  // Debug AdSense ads on page
  debugAds: () => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return;
    }

    console.group('🔍 AdSense Debug Info');
    console.log('AdSense Status:', AdSenseUtils.getAdSenseStatus());
    console.log('AdSense Object:', (window as any).adsbygoogle);
    
    const ads = document.querySelectorAll('.adsbygoogle');
    console.log(`Found ${ads.length} ad containers on page:`);
    
    ads.forEach((ad, index) => {
      const slot = ad.getAttribute('data-ad-slot');
      const client = ad.getAttribute('data-ad-client');
      console.log(`Ad ${index + 1}: Slot=${slot}, Client=${client}`);
    });
    
    console.groupEnd();
  },

  // Refresh ads (useful for SPA navigation)
  refreshAds: () => {
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        // This will refresh all ads on the page
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        console.log('AdSense ads refreshed');
      }
    } catch (error) {
      console.error('Error refreshing AdSense ads:', error);
    }
  },

  isLoaded: () => {
    return false;
  }
};

// Hook for using AdSense in React components
export const useAdSense = () => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const checkAdSense = () => {
      setIsLoaded(AdSenseUtils.isLoaded());
    };

    // Check immediately
    checkAdSense();

    // Also check after a delay in case script is still loading
    const timer = setTimeout(checkAdSense, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    isLoaded,
    status: AdSenseUtils.getAdSenseStatus(),
    debug: AdSenseUtils.debugAds,
    refresh: AdSenseUtils.refreshAds
  };
};
