import React, { useEffect, useRef } from 'react';

type AdSize = '300x250' | '728x90' | '160x600' | '160x300' | '468x60' | '320x50' | 'native';

interface AdBannerProps {
  size: AdSize;
  className?: string;
}

const AD_CONFIG: Record<AdSize, { key: string; width: number; height: number; src: string }> = {
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
    height: 0,
    src: '//pl27701721.effectivegatecpm.com/e38f7b8d13d3c6ad12cd625c9c483842/invoke.js'
  }
};

const AdBanner: React.FC<AdBannerProps> = ({ size, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || !containerRef.current) return;
    
    const config = AD_CONFIG[size];
    if (!config) return;

    loadedRef.current = true;

    if (size === 'native') {
      // Native ad
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = config.src;
      
      const container = document.createElement('div');
      container.id = `container-${config.key}`;
      
      containerRef.current.appendChild(container);
      containerRef.current.appendChild(script);
    } else {
      // Banner ad - set atOptions on window first
      const optionsScript = document.createElement('script');
      optionsScript.type = 'text/javascript';
      optionsScript.textContent = `
        window.atOptions = {
          'key': '${config.key}',
          'format': 'iframe',
          'height': ${config.height},
          'width': ${config.width},
          'params': {}
        };
      `;
      
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = config.src;
      
      containerRef.current.appendChild(optionsScript);
      containerRef.current.appendChild(invokeScript);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      loadedRef.current = false;
    };
  }, [size]);

  const config = AD_CONFIG[size];
  
  return (
    <div 
      ref={containerRef}
      className={`ad-container flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden ${className}`}
      style={{ 
        minWidth: config?.width || 'auto',
        minHeight: config?.height || 100,
        maxWidth: '100%'
      }}
      aria-label="Advertisement"
    />
  );
};

export default AdBanner;
