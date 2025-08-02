import React, { useEffect, useRef } from 'react';

const MobileBannerAd: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Clear existing content
      containerRef.current.innerHTML = '';
      
      // Create script elements
      const optionsScript = document.createElement('script');
      optionsScript.type = 'text/javascript';
      optionsScript.innerHTML = `
        atOptions = {
          'key' : '320x50',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      `;
      
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = '//www.highperformanceformat.com/74b4eeb76902944fd342002807fd5a4a/invoke.js';
      
      // Append scripts
      containerRef.current.appendChild(optionsScript);
      containerRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className="flex justify-center md:hidden">
      <div 
        ref={containerRef}
        className="w-[320px] h-[50px] flex items-center justify-center bg-gray-50 rounded border"
      />
    </div>
  );
};

export default MobileBannerAd;