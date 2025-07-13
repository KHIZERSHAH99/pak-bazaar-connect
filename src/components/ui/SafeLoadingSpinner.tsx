
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SafeLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  timeout?: number; // in milliseconds
  onTimeout?: () => void;
}

const SafeLoadingSpinner: React.FC<SafeLoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text,
  timeout = 15000, // 15 second default timeout
  onTimeout
}) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setHasTimedOut(true);
      onTimeout?.();
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [timeout, onTimeout]);

  if (hasTimedOut) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
        <div className="text-destructive">
          <svg className={cn(sizeClasses[size])} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground font-poppins">
          Loading is taking longer than expected. Please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizeClasses[size]
      )} />
      {text && (
        <p className="text-sm text-muted-foreground font-poppins animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default SafeLoadingSpinner;
