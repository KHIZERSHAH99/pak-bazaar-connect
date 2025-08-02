import React, { useEffect, useRef } from 'react';

const LeaderboardAdBanner: React.FC = () => {
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
          'key' : '097576b5a2cc73324b0a3294b1a029f5',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = '//www.highperformanceformat.com/097576b5a2cc73324b0a3294b1a029f5/invoke.js';
      
      // Append scripts
      containerRef.current.appendChild(optionsScript);
      containerRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className="flex justify-center w-full">
      <div 
        ref={containerRef}
        className="w-full max-w-[728px] min-h-[90px] flex items-center justify-center bg-gray-50 rounded border"
      />
    </div>
  );
};

export default LeaderboardAdBanner;