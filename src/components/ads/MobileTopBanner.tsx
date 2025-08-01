import React, { useEffect, useRef } from 'react';

const MobileTopBanner: React.FC = () => {
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
          'key' : '74b4eeb76902944fd342002807fd5a4a',
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
    <div className="md:hidden py-2 bg-gray-50/50">
      <div className="text-xs text-gray-500 text-center mb-1">Advertisement</div>
      <div className="flex justify-center">
        <div 
          ref={containerRef}
          className="w-[300px] h-[50px] flex items-center justify-center bg-gray-50 rounded border"
        />
      </div>
    </div>
  );
};

export default MobileTopBanner;