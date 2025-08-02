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
      
      // Clear existing content but keep the fallback
      const fallback = containerRef.current.querySelector('.ad-fallback');
      
      // Test with just one script first
      setTimeout(() => {
        try {
          console.log('Loading single HilTop script test');
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.async = true;
          script.src = "//euphoric-square.com/bmX.VJs/dfGNlJ0nYeWuck/ze-mr9kuqZMUblxkCPETnYN1NNWT/cyyZMnj/gVt/NDjCUX1ANdzoIhy/O_Qg";
          script.referrerPolicy = 'no-referrer-when-downgrade';
          
          script.onload = () => {
            console.log('HilTop script loaded successfully');
            if (fallback) (fallback as HTMLElement).style.display = 'none';
          };
          
          script.onerror = (error) => {
            console.error('HilTop script failed to load:', error);
          };
          
          document.head.appendChild(script);
          
          // Alternative method - direct eval
          setTimeout(() => {
            try {
              (function(euun: any){
                console.log('Direct eval HilTop script execution');
                var d = document,
                    s = d.createElement('script'),
                    l = d.scripts[d.scripts.length - 1];
                (s as any).settings = euun || {};
                s.src = "//euphoric-square.com/bmX.VJs/dfGNlJ0nYeWuck/ze-mr9kuqZMUblxkCPETnYN1NNWT/cyyZMnj/gVt/NDjCUX1ANdzoIhy/O_Qg";
                s.async = true;
                s.referrerPolicy = 'no-referrer-when-downgrade';
                l.parentNode!.insertBefore(s, l);
              })({});
              console.log('Direct eval executed successfully');
            } catch (error) {
              console.error('Direct eval failed:', error);
            }
          }, 1000);
          
        } catch (error) {
          console.error('Error in script loading:', error);
        }
      }, 500);
      
      // Check for ad content periodically
      let checkCount = 0;
      const checkInterval = setInterval(() => {
        checkCount++;
        if (containerRef.current) {
          const hasAds = document.querySelectorAll('iframe[src*="euphoric-square"]').length > 0 ||
                        document.querySelectorAll('[id*="hiltop"]').length > 0 ||
                        document.querySelectorAll('[class*="hiltop"]').length > 0;
          
          console.log(`Ad check ${checkCount}: Found ads:`, hasAds);
          
          if (hasAds && fallback) {
            (fallback as HTMLElement).style.display = 'none';
            clearInterval(checkInterval);
          }
          
          if (checkCount >= 10) {
            console.log('Ad loading check completed after 10 attempts');
            clearInterval(checkInterval);
          }
        }
      }, 1000);
      
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