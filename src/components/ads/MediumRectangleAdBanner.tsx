import React, { useEffect, useRef } from 'react';

const MediumRectangleAdBanner: React.FC = () => {
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
          'key' : '19504014bfa77eb1a1c95ce36b68cb2d',
          'format' : 'iframe',
          'height' : 250,
          'width' : 300,
          'params' : {}
        };
      `;
      
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = '//www.highperformanceformat.com/19504014bfa77eb1a1c95ce36b68cb2d/invoke.js';
      
      // Append scripts
      containerRef.current.appendChild(optionsScript);
      containerRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className="flex justify-center">
      <div 
        ref={containerRef}
        className="w-[300px] h-[250px] flex items-center justify-center bg-gray-50 rounded border"
      />
    </div>
  );
};

export default MediumRectangleAdBanner;