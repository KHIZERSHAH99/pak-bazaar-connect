import React, { useEffect, useRef, useState } from 'react';

interface HilTopAdProps {
  className?: string;
  adType?: 'banner' | 'rectangle' | 'sidebar';
}

const HilTopAd: React.FC<HilTopAdProps> = ({ 
  className = '', 
  adType = 'banner' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadAd = () => {
      try {
        // Create script element
        const script = document.createElement('script');
        script.src = "//euphoric-square.com/bmX.VJs/dfGNlJ0nYeWuck/ze-mr9kuqZMUblxkCPETnYN1NNWT/cyyZMnj/gVt/NDjCUX1ANdzoIhy/O_Qg";
        script.async = true;
        
        script.onload = () => {
          setIsLoaded(true);
          console.log('HilTop ad loaded');
        };
        
        script.onerror = () => {
          setHasError(true);
          console.error('Failed to load HilTop ad');
        };
        
        // Append to container
        if (containerRef.current) {
          containerRef.current.appendChild(script);
        }
        
        // Timeout fallback
        setTimeout(() => {
          if (!isLoaded) {
            setHasError(true);
          }
        }, 8000);
        
      } catch (error) {
        console.error('Error loading HilTop ad:', error);
        setHasError(true);
      }
    };

    loadAd();
  }, []);

  const getAdDimensions = () => {
    switch (adType) {
      case 'rectangle':
        return { width: '300px', height: '250px' };
      case 'sidebar':
        return { width: '160px', height: '600px' };
      default:
        return { width: '100%', height: '90px', maxWidth: '728px' };
    }
  };

  const dimensions = getAdDimensions();

  if (hasError) {
    return null; // Hide completely if failed
  }

  return (
    <div className={`hiltop-ad-container ${className}`}>
      <div className="text-xs text-gray-500 text-center mb-2">Advertisement</div>
      <div 
        ref={containerRef}
        style={{
          ...dimensions,
          margin: '0 auto',
          display: 'block',
          position: 'relative',
          backgroundColor: isLoaded ? 'transparent' : '#f8f9fa',
          border: isLoaded ? 'none' : '1px dashed #dee2e6',
          borderRadius: '4px',
          minHeight: adType === 'banner' ? '90px' : dimensions.height
        }}
      >
        {!isLoaded && !hasError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#6c757d',
            fontSize: '14px'
          }}>
            Loading...
          </div>
        )}
      </div>
    </div>
  );
};

export default HilTopAd;