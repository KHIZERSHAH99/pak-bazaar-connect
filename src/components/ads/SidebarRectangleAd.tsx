import React, { useEffect, useRef } from 'react';

const SidebarRectangleAd: React.FC = () => {
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
          'key' : '5bb02b15fc62b8e72bf7b96d1dda1de7',
          'format' : 'iframe',
          'height' : 300,
          'width' : 160,
          'params' : {}
        };
      `;
      
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = '//www.highperformanceformat.com/5bb02b15fc62b8e72bf7b96d1dda1de7/invoke.js';
      
      // Append scripts
      containerRef.current.appendChild(optionsScript);
      containerRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className="hidden lg:block">
      <div className="text-xs text-gray-500 text-center mb-2">Advertisement</div>
      <div 
        ref={containerRef}
        className="w-[160px] h-[300px] flex items-center justify-center bg-gray-50 rounded border mx-auto"
      />
    </div>
  );
};

export default SidebarRectangleAd;