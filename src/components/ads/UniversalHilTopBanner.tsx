import React, { useEffect, useRef } from 'react';

interface UniversalHilTopBannerProps {
  className?: string;
  style?: React.CSSProperties;
}

const UniversalHilTopBanner: React.FC<UniversalHilTopBannerProps> = ({
  className = '',
  style = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && typeof window !== 'undefined') {
      // Clear existing content
      containerRef.current.innerHTML = '';
      
      // Create unique container ID
      const containerId = `universal-hiltop-${Math.random().toString(36).substr(2, 9)}`;
      const scriptContainer = document.createElement('div');
      scriptContainer.id = containerId;
      
      // Append to container first
      containerRef.current.appendChild(scriptContainer);
      
      // Create and execute the universal HilTop script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      
      // Universal HilTop script for both mobile and desktop
      script.innerHTML = `
        (function(euun){
          var d = document,
              s = d.createElement('script'),
              l = d.scripts[d.scripts.length - 1];
          s.settings = euun || {};
          s.src = "https://euphoric-square.com/bmX.VJs/dfGNlJ0nYeWuck/ze-mr9kuqZMUblxkCPETnYN1NNWT/cyyZMnj/gVt/NDjCUX1ANdzoIhy/O_Qg";
          s.async = true;
          s.referrerPolicy = 'no-referrer-when-downgrade';
          s.onerror = function() {
            console.log('HilTop script failed to load');
          };
          l.parentNode.insertBefore(s, l);
        })({});
      `;
      
      // Execute the script
      try {
        eval(script.innerHTML);
        console.log('HilTop universal script executed');
      } catch (error) {
        console.error('Error executing HilTop universal script:', error);
      }
      
      // Also append script to document for maximum compatibility
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`universal-hiltop-banner ${className}`}
      style={{
        width: '100%',
        minHeight: '100px',
        ...style
      }}
    />
  );
};

export default UniversalHilTopBanner;