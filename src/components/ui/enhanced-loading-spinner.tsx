
import React from 'react';
import { cn } from '@/lib/utils';

interface EnhancedLoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'spinner';
  className?: string;
  text?: string;
  fullscreen?: boolean;
}

const EnhancedLoadingSpinner: React.FC<EnhancedLoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'spinner',
  className,
  text,
  fullscreen = false
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className={cn("bg-primary rounded-full animate-bounce", sizeClasses[size])} style={{ animationDelay: '0ms' }} />
            <div className={cn("bg-primary rounded-full animate-bounce", sizeClasses[size])} style={{ animationDelay: '150ms' }} />
            <div className={cn("bg-primary rounded-full animate-bounce", sizeClasses[size])} style={{ animationDelay: '300ms' }} />
          </div>
        );
      case 'pulse':
        return (
          <div className={cn(
            "bg-primary rounded-full animate-pulse",
            sizeClasses[size]
          )} />
        );
      default:
        return (
          <div className={cn(
            "animate-spin rounded-full border-2 border-primary/20 border-t-primary",
            sizeClasses[size]
          )} />
        );
    }
  };

  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3",
      fullscreen && "min-h-screen bg-white/80 backdrop-blur-sm",
      className
    )}>
      {renderSpinner()}
      {text && (
        <p className={cn(
          "text-primary font-poppins animate-pulse",
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default EnhancedLoadingSpinner;
