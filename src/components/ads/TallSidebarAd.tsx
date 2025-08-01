import React, { useEffect, useRef } from 'react';

const TallSidebarAd: React.FC = () => {
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
          'key' : '28f3bbf074464d2922113cdbe93ed4d9',
          'format' : 'iframe',
          'height' : 600,
          'width' : 160,
          'params' : {}
        };
      `;
      
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = '//www.highperformanceformat.com/28f3bbf074464d2922113cdbe93ed4d9/invoke.js';
      
      // Append scripts
      containerRef.current.appendChild(optionsScript);
      containerRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className="hidden xl:block sticky top-4">
      <div className="text-xs text-gray-500 text-center mb-2">Advertisement</div>
      <div 
        ref={containerRef}
        className="w-[160px] h-[600px] flex items-center justify-center bg-gray-50 rounded border mx-auto"
      />
    </div>
  );
};

export default TallSidebarAd;