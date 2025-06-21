
import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  variant?: 'card' | 'text' | 'circle' | 'rectangle';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'rectangle',
  width = 'w-full',
  height = 'h-4',
  className,
  count = 1
}) => {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700";
  
  const variants = {
    card: `${baseClasses} rounded-lg p-4 space-y-3`,
    text: `${baseClasses} rounded`,
    circle: `${baseClasses} rounded-full`,
    rectangle: `${baseClasses} rounded`
  };

  const skeletonClass = cn(variants[variant], width, height, className);

  if (variant === 'card') {
    return (
      <div className={skeletonClass}>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
      </div>
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClass} />
      ))}
    </>
  );
};

export default SkeletonLoader;
