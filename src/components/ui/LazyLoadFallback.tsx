import React from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoadFallbackProps {
  message?: string;
}

const LazyLoadFallback: React.FC<LazyLoadFallbackProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
};

export default LazyLoadFallback;
