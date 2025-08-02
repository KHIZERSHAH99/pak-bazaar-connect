import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdsteeraBannerProps {
  zoneId?: string;
  adType?: 'banner' | 'rectangle' | 'sidebar';
  className?: string;
  style?: React.CSSProperties;
}

const AdsteeraBanner: React.FC<AdsteeraBannerProps> = ({
  zoneId,
  adType = 'banner',
  className = '',
  style = {}
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const getAdDimensions = () => {
    switch (adType) {
      case 'rectangle':
        return { width: 300, height: 250 };
      case 'sidebar':
        return { width: 160, height: 600 };
      default:
        return { width: 728, height: 90 };
    }
  };

  const getAdStyles = () => {
    const dimensions = getAdDimensions();
    return { 
      width: `${dimensions.width}px`, 
      height: `${dimensions.height}px`, 
      ...style 
    };
  };

  useEffect(() => {
    const loadAd = async () => {
      if (!adRef.current) return;

      try {
        setIsLoading(true);
        setError(false);

        const dimensions = getAdDimensions();
        
        const { data, error: functionError } = await supabase.functions.invoke('adsteera-ads', {
          body: {
            zone_id: zoneId,
            format: adType,
            width: dimensions.width,
            height: dimensions.height,
          },
        });

        if (functionError) {
          console.error('Adsteera function error:', functionError);
          setError(true);
          return;
        }

        if (data?.success && data?.ad_code && adRef.current) {
          adRef.current.innerHTML = data.ad_code;
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error loading Adsteera ad:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadAd();
  }, [zoneId, adType]);

  if (error) {
    const dimensions = getAdDimensions();
    return (
      <div 
        className={`adsteera-ad ${className}`} 
        style={{
          background: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          ...style
        }}
      >
        <span style={{ color: '#6c757d', fontSize: '12px' }}>
          Advertisement Space
        </span>
      </div>
    );
  }

  if (isLoading) {
    const dimensions = getAdDimensions();
    return (
      <div 
        className={`adsteera-ad ${className}`} 
        style={{
          background: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          ...style
        }}
      >
        <span style={{ color: '#6c757d', fontSize: '12px' }}>
          Loading Ad...
        </span>
      </div>
    );
  }

  return (
    <div 
      ref={adRef}
      className={`adsteera-ad ${className}`} 
      style={{
        background: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '90px',
        ...getAdStyles()
      }}
      data-zone-id={zoneId}
    />
  );
};

export default AdsteeraBanner;