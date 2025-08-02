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

  React.useEffect(() => {
    console.log('UniversalHilTopBanner: Component mounted');
    
    if (containerRef.current && typeof window !== 'undefined') {
      console.log('UniversalHilTopBanner: Container available, initializing scripts');
      
      // Create a unique ID for this container
      const containerId = `hiltop-container-${Math.random().toString(36).substr(2, 9)}`;
      containerRef.current.id = containerId;
      
      // Clear existing content but keep the fallback
      const fallback = containerRef.current.querySelector('.ad-fallback');
      
      // Force containment with aggressive CSS
      const style = document.createElement('style');
      style.className = `hiltop-style-${containerId}`;
      style.textContent = `
        #${containerId} * {
          position: static !important;
          top: auto !important;
          left: auto !important;
          right: auto !important;
          bottom: auto !important;
          transform: none !important;
          z-index: auto !important;
        }
        
        #${containerId} iframe,
        #${containerId} div,
        #${containerId} span {
          max-width: 100% !important;
          margin: 0 auto !important;
        }
      `;
      document.head.appendChild(style);
      
      // Load script with containment
      setTimeout(() => {
        try {
          console.log('Loading HilTop script with containment');
          
          // Create script element that will be contained
          const scriptElement = document.createElement('div');
          scriptElement.innerHTML = `
            <script type="text/javascript">
              (function() {
                console.log('HilTop script executing in container');
                var container = document.getElementById('${containerId}');
                if (container) {
                  var script = document.createElement('script');
                  script.src = "//euphoric-square.com/bmX.VJs/dfGNlJ0nYeWuck/ze-mr9kuqZMUblxkCPETnYN1NNWT/cyyZMnj/gVt/NDjCUX1ANdzoIhy/O_Qg";
                  script.async = true;
                  script.referrerPolicy = 'no-referrer-when-downgrade';
                  
                  script.onload = function() {
                    console.log('HilTop script loaded');
                    var fallback = container.querySelector('.ad-fallback');
                    if (fallback) fallback.style.display = 'none';
                    
                    // Move any floating elements back to container
                    setTimeout(function() {
                      var floatingAds = document.querySelectorAll('iframe[src*="euphoric-square"], [id*="hiltop"], [class*="hiltop"]');
                      floatingAds.forEach(function(ad) {
                        if (!ad.closest('#${containerId}') && ad.parentNode !== container) {
                          try {
                            container.appendChild(ad);
                            console.log('Moved floating ad to container');
                          } catch(e) {
                            console.log('Could not move ad:', e);
                          }
                        }
                      });
                    }, 1000);
                  };
                  
                  container.appendChild(script);
                }
              })();
            </script>
          `;
          
          // Append to container
          if (containerRef.current) {
            containerRef.current.appendChild(scriptElement);
          }
          
        } catch (error) {
          console.error('Error in script loading:', error);
        }
      }, 500);
      
      // Cleanup floating ads periodically
      const cleanupInterval = setInterval(() => {
        const floatingAds = document.body.querySelectorAll('iframe[src*="euphoric-square"]:not([id*="' + containerId + '"] *)');
        floatingAds.forEach((ad) => {
          if (containerRef.current && !ad.closest('#' + containerId)) {
            try {
              containerRef.current.appendChild(ad);
              console.log('Cleaned up floating ad');
            } catch (e) {
              console.log('Could not cleanup ad:', e);
            }
          }
        });
      }, 2000);
      
      // Cleanup on unmount
      return () => {
        clearInterval(cleanupInterval);
        const styleEl = document.querySelector(`.hiltop-style-${containerId}`);
        if (styleEl) styleEl.remove();
      };
      
    } else {
      console.log('UniversalHilTopBanner: No container or window not available');
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`universal-hiltop-banner ${className}`}
      style={{
        width: '100%',
        height: 'auto',
        minHeight: '100px',
        position: 'relative',
        display: 'block',
        backgroundColor: '#f8f9fa',
        border: '1px dashed #dee2e6',
        borderRadius: '4px',
        ...style
      }}
    >
      {/* Fallback content while ads load */}
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
    </div>
  );
};

export default UniversalHilTopBanner;