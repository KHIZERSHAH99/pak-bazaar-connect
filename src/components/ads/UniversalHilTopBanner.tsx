import React from 'react';

interface UniversalHilTopBannerProps {
  className?: string;
  style?: React.CSSProperties;
}

const UniversalHilTopBanner: React.FC<UniversalHilTopBannerProps> = ({
  className = '',
  style = {}
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = React.useState(false);
  const [adFailed, setAdFailed] = React.useState(false);
  const [showFallback, setShowFallback] = React.useState(true);

  React.useEffect(() => {
    console.log('UniversalHilTopBanner: Component mounted');
    
    if (containerRef.current && typeof window !== 'undefined') {
      const containerId = `hiltop-container-${Math.random().toString(36).substr(2, 9)}`;
      containerRef.current.id = containerId;
      
      // Set timeout for ad loading
      const adTimeout = setTimeout(() => {
        console.log('Ad loading timeout reached');
        setAdFailed(true);
        setShowFallback(false);
      }, 10000); // 10 second timeout
      
      try {
        console.log('Loading HilTop script directly');
        
        // Create script element directly
        const script = document.createElement('script');
        script.src = "//euphoric-square.com/bmX.VJs/dfGNlJ0nYeWuck/ze-mr9kuqZMUblxkCPETnYN1NNWT/cyyZMnj/gVt/NDjCUX1ANdzoIhy/O_Qg";
        script.async = true;
        script.setAttribute('data-container-id', containerId);
        
        script.onload = () => {
          console.log('HilTop script loaded successfully');
          clearTimeout(adTimeout);
          setAdLoaded(true);
          setShowFallback(false);
          
          // Check for ad content after a short delay
          setTimeout(() => {
            const container = document.getElementById(containerId);
            if (container) {
              const adContent = container.querySelector('iframe, [id*="ad"], [class*="ad"]');
              if (adContent) {
                console.log('Ad content detected');
                setShowFallback(false);
              } else {
                console.log('No ad content found, showing fallback');
                setAdFailed(true);
                setShowFallback(false);
              }
            }
          }, 2000);
        };
        
        script.onerror = () => {
          console.error('Failed to load HilTop script');
          clearTimeout(adTimeout);
          setAdFailed(true);
          setShowFallback(false);
        };
        
        // Append script to document head
        document.head.appendChild(script);
        
        // Cleanup on unmount
        return () => {
          clearTimeout(adTimeout);
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
        
      } catch (error) {
        console.error('Error loading ad script:', error);
        setAdFailed(true);
        setShowFallback(false);
      }
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`universal-hiltop-banner ${className}`}
      style={{
        width: '100%',
        height: 'auto',
        minHeight: adFailed ? '0px' : '100px',
        position: 'relative',
        display: adFailed ? 'none' : 'block',
        backgroundColor: '#f8f9fa',
        border: adFailed ? 'none' : '1px dashed #dee2e6',
        borderRadius: '4px',
        ...style
      }}
    >
      {/* Loading state */}
      {showFallback && !adLoaded && !adFailed && (
        <div className="ad-fallback" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100px',
          color: '#6c757d',
          fontSize: '14px',
          backgroundColor: '#f8f9fa'
        }}>
          Loading HilTop Advertisement...
        </div>
      )}
      
      {/* Failed state - hide completely */}
      {adFailed && (
        <div style={{ display: 'none' }} />
      )}
    </div>
  );
};

export default UniversalHilTopBanner;