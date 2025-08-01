import React, { useEffect, useRef } from 'react';

const MobileBottomBanner: React.FC = () => {
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
          'key' : '9b2fde480b2294961627c49845f3e13c',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      `;
      
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = '//www.highperformanceformat.com/9b2fde480b2294961627c49845f3e13c/invoke.js';
      
      // Append scripts
      containerRef.current.appendChild(optionsScript);
      containerRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className="md:hidden py-2 bg-gray-50/50 border-t">
      <div className="text-xs text-gray-500 text-center mb-1">Advertisement</div>
      <div className="flex justify-center">
        <div 
          ref={containerRef}
          className="w-[320px] h-[60px] flex items-center justify-center bg-gray-50 rounded border"
        />
      </div>
    </div>
  );
};

export default MobileBottomBanner;