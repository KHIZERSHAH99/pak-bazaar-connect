
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, BarChart3 } from 'lucide-react';

interface AdActionsProps {
  status: string;
  isAutoStopped: boolean;
  adId: string;
  onPause: (adId: string) => void;
  onResume: (adId: string) => void;
  onViewAnalytics: (adId: string) => void;
}

const AdActions: React.FC<AdActionsProps> = ({
  status,
  isAutoStopped,
  adId,
  onPause,
  onResume,
  onViewAnalytics
}) => {
  return (
    <div className="flex gap-2">
      {status === 'active' && !isAutoStopped && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onPause(adId)}
          className="flex-1"
        >
          <Pause className="h-4 w-4 mr-1" />
          Pause
        </Button>
      )}
      
      {(status === 'paused' || isAutoStopped) && !isAutoStopped && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onResume(adId)}
          className="flex-1"
        >
          <Play className="h-4 w-4 mr-1" />
          Resume
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onViewAnalytics(adId)}
        className="flex-1"
      >
        <BarChart3 className="h-4 w-4 mr-1" />
        Analytics
      </Button>
    </div>
  );
};

export default AdActions;
