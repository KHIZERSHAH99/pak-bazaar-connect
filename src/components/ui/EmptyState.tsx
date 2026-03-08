
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}) => {
  return (
    <Card className={`border-dashed ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150" />
          <div className="relative rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-5 border border-primary/10">
            <Icon className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2 font-poppins">
          {title}
        </h3>
        <p className="text-muted-foreground mb-8 max-w-sm font-poppins text-sm leading-relaxed">
          {description}
        </p>
        <div className="flex gap-3">
          {actionLabel && onAction && (
            <Button 
              onClick={onAction}
              className="bg-primary hover:bg-primary/90 font-poppins"
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button 
              variant="outline"
              onClick={onSecondaryAction}
              className="font-poppins"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
