
import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  lazy?: boolean;
  quality?: 'low' | 'medium' | 'high';
  className?: string;
  containerClassName?: string;
  webpSrc?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc = '/placeholder.svg',
  lazy = true,
  quality = 'medium',
  className,
  containerClassName,
  webpSrc,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(webpSrc || src);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    if (currentSrc === webpSrc && src !== webpSrc) {
      // Try original format if WebP fails
      setCurrentSrc(src);
      return;
    }
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
    }
  }, [currentSrc, fallbackSrc, src, webpSrc]);

  // Generate optimized URL for different quality levels
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    if (originalSrc.includes('unsplash.com')) {
      const qualityParams = {
        low: '&q=50&w=400&fm=webp',
        medium: '&q=75&w=800&fm=webp',
        high: '&q=90&w=1200&fm=webp'
      };
      return `${originalSrc}${qualityParams[quality]}`;
    }
    return originalSrc;
  }, [quality]);

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
          <LoadingSpinner size="sm" />
        </div>
      )}
      
      <picture>
        {webpSrc && <source srcSet={getOptimizedSrc(webpSrc)} type="image/webp" />}
        <img
          src={getOptimizedSrc(currentSrc)}
          alt={alt}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-all duration-500 ease-out",
            isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100",
            hasError && "opacity-60",
            className
          )}
          {...props}
        />
      </picture>
      
      {hasError && (
        <div className="absolute top-2 right-2 bg-destructive/90 text-destructive-foreground text-xs px-2 py-1 rounded-md backdrop-blur-sm">
          Failed to load
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
