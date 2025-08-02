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
      
      // Create a unique container for the multitag script
      const scriptContainer = document.createElement('div');
      scriptContainer.style.cssText = `
        width: 100%;
        min-height: ${device === 'desktop' ? '250px' : '100px'};
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      
      if (device === 'desktop') {
        // PC multitag banner script
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
          })({})
        `;
      } else {
        // Mobile multitag banner script
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
          })({})
        `;
      }
      
      // Append the script to head instead of container
      document.head.appendChild(script);
      
      // Create fallback display
      const fallbackDiv = document.createElement('div');
      fallbackDiv.style.cssText = `
        min-height: ${device === 'desktop' ? '250px' : '100px'};
        width: 100%;
        background: linear-gradient(45deg, #2196F3, #64B5F6);
        color: white;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        text-align: center;
        font-family: Arial, sans-serif;
      `;
      fallbackDiv.innerHTML = `<div>HilTop Multitag<br>${device === 'desktop' ? 'Desktop' : 'Mobile'} Banner</div>`;
      
      scriptContainer.appendChild(fallbackDiv);
      containerRef.current.appendChild(scriptContainer);
      
      // Remove fallback after ads load
      setTimeout(() => {
        if (fallbackDiv.parentNode && containerRef.current?.children.length > 1) {
          fallbackDiv.remove();
        }
      }, 5000);
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