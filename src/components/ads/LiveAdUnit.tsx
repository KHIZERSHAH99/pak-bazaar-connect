import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LiveAdUnitProps {
  placement: string;
  size?: 'banner' | 'leaderboard' | 'rectangle' | 'skyscraper';
  className?: string;
}

interface AdData {
  id: string;
  headline: string;
  image: string;
  url: string;
  type: string;
  impressionUrl?: string;
}

const LiveAdUnit: React.FC<LiveAdUnitProps> = ({ 
  placement, 
  size = 'banner',
  className 
}) => {
  const [ad, setAd] = useState<AdData | null>(null);
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
    const fetchAd = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.functions.invoke('fetch-ads', {
          body: { placement, size }
        });

        if (error) throw error;

        if (data?.success && data?.ad) {
          setAd(data.ad);
          
          // Track impression if URL provided
          if (data.ad.impressionUrl) {
            const img = new Image();
            img.src = data.ad.impressionUrl;
          }
        } else {
          throw new Error('No ads available');
        }
      } catch (err) {
        console.error('Error fetching ad:', err);
        setError('Unable to load ad');
        
        // Fallback to static ad
        setAd({
          id: 'fallback',
          headline: 'Advertise Here',
          image: '/placeholder.svg',
          url: '/contact',
          type: 'display'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [placement, size]);

  const handleAdClick = async () => {
    if (!ad) return;

    // Track click
    try {
      await supabase.from('ad_clicks').insert({
        ad_id: ad.id,
        placement,
        clicked_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error tracking ad click:', err);
    }

    // Open ad URL
    window.open(ad.url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted/30 rounded-lg",
        getSizeStyles(),
        className
      )}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !ad) {
    return null;
  }

  if (!ad) return null;

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      <div 
        className={cn(
          "cursor-pointer transition-opacity hover:opacity-90",
          getSizeStyles()
        )}
        onClick={handleAdClick}
      >
        {ad.type === 'display' ? (
          <div className="relative w-full h-full">
            <img 
              src={ad.image} 
              alt={ad.headline}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {ad.headline && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-sm font-medium truncate">
                  {ad.headline}
                </p>
              </div>
            )}
            <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1 py-0.5 rounded">
              Ad
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">Ad Space</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveAdUnit;