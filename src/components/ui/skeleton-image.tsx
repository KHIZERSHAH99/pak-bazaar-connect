
import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonImageProps {
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'wide';
}

const SkeletonImage: React.FC<SkeletonImageProps> = ({
  className,
  aspectRatio = 'square'
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[16/9]'
  };

  return (
    <div className={cn(
      "bg-gradient-to-br from-muted/50 via-muted to-muted/50 animate-pulse rounded-lg",
      "relative overflow-hidden",
      aspectClasses[aspectRatio],
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-transparent animate-shimmer" />
    </div>
  );
};

export default SkeletonImage;
