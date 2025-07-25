import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  quality?: number;
  lazy?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

// Supabase image transformation helper
const getOptimizedImageUrl = (url: string, options: { width?: number; height?: number; quality?: number } = {}) => {
  if (!url || !url.includes('supabase.co/storage')) {
    return url;
  }

  const { width = 400, height = 400, quality = 75 } = options;
  
  // Add Supabase image transformation parameters
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${width}&height=${height}&quality=${quality}&format=webp`;
};

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  placeholder,
  width = 400,
  height = 400,
  quality = 75,
  lazy = true,
  onLoad,
  onError
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Memoize optimized URL to prevent unnecessary recalculations
  const optimizedSrc = useMemo(() => 
    getOptimizedImageUrl(src, { width, height, quality }), 
    [src, width, height, quality]
  );

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || inView) return;

    const observerOptions = {
      rootMargin: '50px', // Start loading 50px before image comes into view
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setInView(true);
          observerRef.current?.disconnect();
        }
      });
    }, observerOptions);

    const imgElement = imgRef.current;
    if (imgElement) {
      observerRef.current.observe(imgElement);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, inView]);

  // Image loading handlers
  useEffect(() => {
    if (!inView) return;

    const img = imgRef.current;
    if (!img) return;

    const handleLoad = () => {
      setLoaded(true);
      setError(false);
      onLoad?.();
    };

    const handleError = () => {
      setError(true);
      setLoaded(false);
      onError?.();
    };

    if (img.complete && img.naturalHeight !== 0) {
      handleLoad();
    } else {
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
    }

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [inView, optimizedSrc, onLoad, onError]);

  const defaultPlaceholder = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%20width='300'%20height='200'%3e%3crect%20width='100%25'%20height='100%25'%20fill='%23f3f4f6'/%3e%3c/svg%3e";

  return (
    <div className={cn("relative overflow-hidden bg-gray-50", className)}>
      {/* Placeholder */}
      {!loaded && !error && (
        <div 
          className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center"
          style={{
            backgroundImage: `url("${placeholder || defaultPlaceholder}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={inView ? optimizedSrc : undefined}
        alt={alt}
        loading={lazy ? "lazy" : "eager"}
        decoding="async"
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          error && "hidden"
        )}
        style={{
          aspectRatio: width && height ? `${width} / ${height}` : 'auto'
        }}
      />
      
      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;