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
      
      const script = document.createElement('script');
      script.type = 'text/javascript';
      
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
      
      // Append the script to container
      containerRef.current.appendChild(script);
      
      // Create fallback display
      const fallbackDiv = document.createElement('div');
      fallbackDiv.style.cssText = `
        min-height: ${device === 'desktop' ? '250px' : '100px'};
        width: 100%;
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: #6c757d;
        margin-top: 10px;
      `;
      fallbackDiv.textContent = `HilTop Multitag ${device === 'desktop' ? 'Desktop' : 'Mobile'} Banner`;
      containerRef.current.appendChild(fallbackDiv);
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