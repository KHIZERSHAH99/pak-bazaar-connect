import React, { useEffect, useRef, memo, useState } from 'react';

type AdSize = '300x250' | '728x90' | '160x600' | '160x300' | '468x60' | '320x50' | 'native';

interface AdBannerProps {
  size: AdSize;
  className?: string;
}

const AD_CONFIG: Record<AdSize, { key: string; width: number; height: number; src: string; isNative?: boolean }> = {
  '300x250': {
    key: '6e906f54278379013dea325356cedfea',
    width: 300,
    height: 250,
    src: '//www.highperformanceformat.com/6e906f54278379013dea325356cedfea/invoke.js'
  },
  '728x90': {
    key: '987a9a316732abab62bdd80e2baaaa93',
    width: 728,
    height: 90,
    src: '//www.highperformanceformat.com/987a9a316732abab62bdd80e2baaaa93/invoke.js'
  },
  '160x600': {
    key: 'e30a2bc2dccbb1f927dfa1de88c6da80',
    width: 160,
    height: 600,
    src: '//www.highperformanceformat.com/e30a2bc2dccbb1f927dfa1de88c6da80/invoke.js'
  },
  '160x300': {
    key: 'a6eb4fc26806968df42c310267719019',
    width: 160,
    height: 300,
    src: '//www.highperformanceformat.com/a6eb4fc26806968df42c310267719019/invoke.js'
  },
  '468x60': {
    key: '4ca53a30c3288ee4c14365b01965f143',
    width: 468,
    height: 60,
    src: '//www.highperformanceformat.com/4ca53a30c3288ee4c14365b01965f143/invoke.js'
  },
  '320x50': {
    key: '9417818636aacc88f0c4b1dee7ca88c4',
    width: 320,
    height: 50,
    src: '//www.highperformanceformat.com/9417818636aacc88f0c4b1dee7ca88c4/invoke.js'
  },
  'native': {
    key: 'e38f7b8d13d3c6ad12cd625c9c483842',
    width: 0,
    height: 100,
    src: '//pl27701721.effectivegatecpm.com/e38f7b8d13d3c6ad12cd625c9c483842/invoke.js',
    isNative: true
  }
};

const AdBanner: React.FC<AdBannerProps> = memo(({ size, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useRef(`ad-${size}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [hasContent, setHasContent] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    const config = AD_CONFIG[size];
    if (!config || !containerRef.current || loadedRef.current) return;

    loadedRef.current = true;
    const container = containerRef.current;
    
    // Clear any existing content
    container.innerHTML = '';

    // Check for ad content periodically
    const checkForContent = () => {
      if (container && container.children.length > 0) {
        const hasIframe = container.querySelector('iframe');
        const hasAd = container.querySelector('ins, .adsbygoogle, [id*="aswift"]');
        if (hasIframe || hasAd || container.innerHTML.length > 100) {
          setHasContent(true);
          setShowFallback(false);
          return true;
        }
      }
      return false;
    };

    // Set a timeout to show fallback if ad doesn't load
    const fallbackTimer = setTimeout(() => {
      if (!checkForContent()) {
        setShowFallback(true);
      }
    }, 8000); // 8 seconds timeout

    // Check periodically for ad content
    const contentChecker = setInterval(() => {
      if (checkForContent()) {
        clearInterval(contentChecker);
      }
    }, 1000);

    if (config.isNative) {
      // Native ad handling
      const nativeContainer = document.createElement('div');
      nativeContainer.id = `container-${config.key}`;
      container.appendChild(nativeContainer);

      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = config.src;
      container.appendChild(script);
    } else {
      // Banner ad - create isolated container with inline script
      const adWrapper = document.createElement('div');
      adWrapper.id = uniqueId.current;
      adWrapper.style.width = `${config.width}px`;
      adWrapper.style.height = `${config.height}px`;
      adWrapper.style.margin = '0 auto';
      container.appendChild(adWrapper);

      // Create inline script that sets atOptions immediately before invoke
      const inlineScript = document.createElement('script');
      inlineScript.type = 'text/javascript';
      inlineScript.textContent = `
        atOptions = {
          'key': '${config.key}',
          'format': 'iframe',
          'height': ${config.height},
          'width': ${config.width},
          'params': {}
        };
      `;
      container.appendChild(inlineScript);

      // Load the invoke script immediately after setting atOptions
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = config.src;
      invokeScript.async = false; // Important: load synchronously after atOptions
      container.appendChild(invokeScript);
    }

    return () => {
      clearTimeout(fallbackTimer);
      clearInterval(contentChecker);
    };
  }, [size]);

  const config = AD_CONFIG[size];
  
  // Fallback placeholder component
  const FallbackPlaceholder = () => (
    <div 
      className="flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/50 rounded-lg border border-border/30"
      style={{ 
        width: config?.width || '100%',
        height: config?.height || 100,
        maxWidth: '100%'
      }}
    >
      <div className="text-center p-4">
        <p className="text-xs text-muted-foreground/60">Sponsored</p>
      </div>
    </div>
  );
  
  return (
    <div className={`ad-container flex items-center justify-center overflow-hidden ${className}`}>
      <div 
        ref={containerRef}
        style={{ 
          minWidth: config?.width || 'auto',
          minHeight: config?.height || 100,
          maxWidth: '100%',
          display: showFallback && !hasContent ? 'none' : 'block'
        }}
        aria-label="Advertisement"
      />
      {showFallback && !hasContent && <FallbackPlaceholder />}
    </div>
  );
});

AdBanner.displayName = 'AdBanner';

export default AdBanner;
