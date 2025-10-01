import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LiveAdUnitProps {
  placement: string;
  size?: 'banner' | 'leaderboard' | 'rectangle' | 'skyscraper';
  className?: string;
}

const LiveAdUnit: React.FC<LiveAdUnitProps> = ({ 
  placement, 
  size = 'banner',
  className 
}) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getSizeStyles = () => {
    switch (size) {
      case 'banner':
        return 'w-[728px] h-[90px]';
      case 'leaderboard':
        return 'w-[728px] h-[90px]';
      case 'rectangle':
        return 'w-[300px] h-[250px]';
      case 'skyscraper':
        return 'w-[160px] h-[600px]';
      default:
        return 'w-[728px] h-[90px]';
    }
  };

  useEffect(() => {
    const loadAdsterraAd = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch ad configuration from edge function
        const { data, error: fetchError } = await supabase.functions.invoke('fetch-ads', {
          body: { placement, size }
        });

        if (fetchError) throw fetchError;

        if (data?.success && data?.ad) {
          const { key, scriptUrl, width, height } = data.ad;
          
          if (adContainerRef.current) {
            // Clear previous content
            adContainerRef.current.innerHTML = '';
            
            // Create Adsterra ad container
            const adDiv = document.createElement('div');
            adDiv.id = `adsterra-${placement}-${Date.now()}`;
            adDiv.style.width = `${width}px`;
            adDiv.style.height = `${height}px`;
            adDiv.style.display = 'block';
            adDiv.style.margin = '0 auto';
            adContainerRef.current.appendChild(adDiv);
            
            // Create and inject Adsterra script
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            
            // Set up atOptions before loading the script
            const atOptions = {
              'key': key,
              'format': 'iframe',
              'height': height,
              'width': width,
              'params': {}
            };
            
            // Set atOptions directly on window
            (window as any).atOptions = atOptions;
            
            // Load Adsterra invoke script
            const invokeScript = document.createElement('script');
            invokeScript.type = 'text/javascript';
            invokeScript.src = `https:${scriptUrl}`;
            invokeScript.async = true;
            
            invokeScript.onload = () => {
              setLoading(false);
              console.log('Adsterra ad loaded successfully');
            };
            
            invokeScript.onerror = () => {
              console.error('Failed to load Adsterra script');
              setError('Failed to load advertisement');
              setLoading(false);
            };
            
            adDiv.appendChild(invokeScript);
          }
        } else {
          throw new Error('No ad configuration available');
        }
      } catch (err) {
        console.error('Error loading Adsterra ad:', err);
        setError('Unable to load advertisement');
        setLoading(false);
      }
    };

    loadAdsterraAd();
    
    // Cleanup function
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, [placement, size]);

  if (error) {
    // Don't show error UI, just hide the ad space
    return null;
  }

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      <div 
        ref={adContainerRef}
        className={cn(
          "relative",
          getSizeStyles()
        )}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveAdUnit;