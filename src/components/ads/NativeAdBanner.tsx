import React, { useEffect, useRef, useState } from 'react';

interface NativeAdBannerProps {
  className?: string;
  style?: React.CSSProperties;
}

const NativeAdBanner: React.FC<NativeAdBannerProps> = ({ 
  className = '', 
  style = {} 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadAdScript = () => {
      try {
        // Check if script is already loaded
        const existingScript = document.querySelector('script[src*="profitableratecpm.com"]');
        if (existingScript) {
          setIsLoaded(true);
          return;
        }

        // Create and load the script
        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = '//pl27318427.profitableratecpm.com/91361b3648526b5c534eb47973da3d5f/invoke.js';
        
        script.onload = () => {
          setIsLoaded(true);
          setHasError(false);
        };
        
        script.onerror = () => {
          setHasError(true);
          setIsLoaded(false);
        };

        document.head.appendChild(script);

        // Cleanup function
        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      } catch (error) {
        console.error('Error loading Adsteera script:', error);
        setHasError(true);
      }
    };

    const cleanup = loadAdScript();
    
    return cleanup;
  }, []);

  if (hasError) {
    return (
      <div 
        className={`bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center p-4 ${className}`}
        style={{ minHeight: '100px', ...style }}
      >
        <span className="text-xs text-gray-500">Advertisement Space</span>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <div 
        ref={containerRef}
        id="container-91361b3648526b5c534eb47973da3d5f"
        className="min-h-[100px] flex items-center justify-center"
      >
        {!isLoaded && (
          <span className="text-xs text-gray-500">Loading Advertisement...</span>
        )}
      </div>
    </div>
  );
};

export default NativeAdBanner;