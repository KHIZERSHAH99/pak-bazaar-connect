import React from 'react';
import AdUnit from './AdUnit';
import { cn } from '@/lib/utils';

interface StickyAdUnitProps {
  slotId: string;
  position?: 'left' | 'right';
  className?: string;
}

const StickyAdUnit: React.FC<StickyAdUnitProps> = ({ 
  slotId, 
  position = 'right',
  className 
}) => {
  return (
    <div 
      className={cn(
        "sticky top-20 z-10",
        position === 'left' ? 'left-4' : 'right-4',
        className
      )}
    >
      <AdUnit 
        slotId={slotId}
        format="display"
        size="skyscraper"
        className="shadow-lg"
      />
    </div>
  );
};

export default StickyAdUnit;