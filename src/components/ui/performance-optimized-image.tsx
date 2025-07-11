
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PerformanceOptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  webpSrc?: string;
  avifSrc?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  className?: string;
  containerClassName?: string;
  onLoadingComplete?: () => void;
  blurDataURL?: string;
}

const PerformanceOptimizedImage: React.FC<PerformanceOptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc = '/placeholder.svg',
  webpSrc,
  avifSrc,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  quality = 75,
  className,
  containerClassName,
  onLoadingComplete,
  blurDataURL,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoadingComplete?.();
  }, [onLoadingComplete]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // Generate responsive src sets
  const generateSrcSet = (baseSrc: string) => {
    const widths = [320, 640, 768, 1024, 1280, 1600];
    return widths
      .map(width => {
        if (baseSrc.includes('unsplash.com')) {
          return `${baseSrc}&w=${width}&q=${quality} ${width}w`;
        }
        return `${baseSrc} ${width}w`;
      })
      .join(', ');
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden", containerClassName)}
    >
      {/* Blur placeholder */}
      {blurDataURL && isLoading && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm"
          aria-hidden="true"
        />
      )}

      {/* Loading skeleton */}
      {isLoading && !blurDataURL && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
      )}

      {/* Main image */}
      {isInView && (
        <picture>
          {avifSrc && (
            <source 
              srcSet={generateSrcSet(avifSrc)} 
              sizes={sizes}
              type="image/avif" 
            />
          )}
          {webpSrc && (
            <source 
              srcSet={generateSrcSet(webpSrc)} 
              sizes={sizes}
              type="image/webp" 
            />
          )}
          <img
            ref={imgRef}
            src={src}
            srcSet={generateSrcSet(src)}
            sizes={sizes}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-opacity duration-500",
              isLoading ? "opacity-0" : "opacity-100",
              hasError && "opacity-60",
              className
            )}
            {...props}
          />
        </picture>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground p-4">
            <div className="text-2xl mb-2">📷</div>
            <p className="text-sm font-poppins">Image failed to load</p>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-pakistani_green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default PerformanceOptimizedImage;
