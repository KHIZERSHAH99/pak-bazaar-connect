import React, { useEffect, useRef, memo } from 'react';
import postscribe from 'postscribe';

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
  const hasInitialized = useRef(false);
  const uniqueId = useRef(`ad-${size}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const config = AD_CONFIG[size];
    if (!config || !containerRef.current || hasInitialized.current) return;
    
    hasInitialized.current = true;
    const container = containerRef.current;
    
    // Clear any existing content
    container.innerHTML = '';

    try {
      if (config.isNative) {
        // Native ad: create container div then load script using postscribe
        const scriptContent = `
          <div id="container-${config.key}"></div>
          <script async="async" data-cfasync="false" src="${config.src}"></script>
        `;
        
        postscribe(container, scriptContent, {
          error: (err) => console.warn('Native ad load error:', err)
        });
      } else {
        // Banner ad: inject atOptions THEN invoke.js using postscribe
        // This safely handles the document.write() calls from Adsteera
        const scriptContent = `
          <script type="text/javascript">
            atOptions = {
              'key' : '${config.key}',
              'format' : 'iframe',
              'height' : ${config.height},
              'width' : ${config.width},
              'params' : {}
            };
          </script>
          <script type="text/javascript" src="${config.src}"></script>
        `;
        
        postscribe(container, scriptContent, {
          error: (err) => console.warn('Banner ad load error:', err)
        });
      }
    } catch (error) {
      console.warn('Ad initialization error:', error);
    }

    return () => {
      // Cleanup on unmount
      if (container) {
        container.innerHTML = '';
      }
      hasInitialized.current = false;
    };
  }, [size]);

  const config = AD_CONFIG[size];
  
  return (
    <div className={`ad-container flex items-center justify-center overflow-hidden ${className}`}>
      <div 
        ref={containerRef}
        id={uniqueId.current}
        style={{ 
          minWidth: config?.isNative ? 'auto' : config?.width,
          minHeight: config?.height || 100,
          maxWidth: '100%'
        }}
        aria-label="Advertisement"
      />
    </div>
  );
});

AdBanner.displayName = 'AdBanner';

export default AdBanner;
