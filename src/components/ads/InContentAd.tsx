import React from 'react';
import AdUnit from './AdUnit';
import { cn } from '@/lib/utils';

interface InContentAdProps {
  slotId: string;
  className?: string;
}

const InContentAd: React.FC<InContentAdProps> = ({ slotId, className }) => {
  return (
    <div className={cn("my-8 flex justify-center", className)}>
      <div className="w-full max-w-[728px]">
        <AdUnit 
          slotId={slotId}
          format="native"
          size="leaderboard"
          className="mx-auto"
        />
      </div>
    </div>
  );
};

export default InContentAd;