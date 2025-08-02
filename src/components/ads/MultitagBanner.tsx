import React, { useEffect, useRef } from 'react';

interface MultitagBannerProps {
  device?: 'desktop' | 'mobile';
  className?: string;
  style?: React.CSSProperties;
}

const MultitagBanner: React.FC<MultitagBannerProps> = ({
  device = 'desktop',
  className = '',
  style = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && typeof window !== 'undefined') {
      // Clear existing content
      containerRef.current.innerHTML = '';
      
      // Create unique container ID
      const containerId = `multitag-${device}-${Math.random().toString(36).substr(2, 9)}`;
      const scriptContainer = document.createElement('div');
      scriptContainer.id = containerId;
      
      // Append to container first
      containerRef.current.appendChild(scriptContainer);
      
      // Create and execute the multitag script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      
      if (device === 'desktop') {
        // PC multitag banner script - execute immediately
        script.innerHTML = `
          (function(rktxg){
            var d = document,
                s = d.createElement('script'),
                l = d.scripts[d.scripts.length - 1];
            s.settings = rktxg || {};
            s.src = "//euphoric-square.com/bDX.VAsEdWG/lN0vYGWIcq/TeKmX9/u/Z/UdlMkWPGT_YQ1JNNTucQySMnjygVtvN/jbU/1jNjzlIlyMOsQT";
            s.async = true;
            s.referrerPolicy = 'no-referrer-when-downgrade';
            l.parentNode.insertBefore(s, l);
          })({});
        `;
      } else {
        // Mobile multitag banner script - execute immediately
        script.innerHTML = `
          (function(wqfg){
            var d = document,
                s = d.createElement('script'),
                l = d.scripts[d.scripts.length - 1];
            s.settings = wqfg || {};
            s.src = "//euphoric-square.com/bKXoV/s.dIGQlQ0aYFWRcU/ae_mm9/uzZKUrlckcPDTGYG1aNvTSc/yfNJDHACtKN_jnUN1/NrzbIN0LMgQT";
            s.async = true;
            s.referrerPolicy = 'no-referrer-when-downgrade';
            l.parentNode.insertBefore(s, l);
          })({});
        `;
      }
      
      // Execute the script
      try {
        eval(script.innerHTML);
        console.log(`HilTop multitag ${device} script executed`);
      } catch (error) {
        console.error(`Error executing HilTop multitag ${device} script:`, error);
      }
      
      // Also append script to document for maximum compatibility
      document.head.appendChild(script);
    }
  }, [device]);

  return (
    <div 
      ref={containerRef}
      className={`multitag-banner ${className}`}
      style={{
        width: '100%',
        minHeight: device === 'desktop' ? '250px' : '100px',
        ...style
      }}
      data-device={device}
    />
  );
};

export default MultitagBanner;