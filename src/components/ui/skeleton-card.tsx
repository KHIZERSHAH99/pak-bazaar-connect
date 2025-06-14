
import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const SkeletonCard: React.FC = () => (
  <Card className="p-6 animate-pulse">
    <div className="flex items-center mb-4">
      <Skeleton className="h-12 w-12 rounded-full mr-4" />
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <Skeleton className="h-10 w-full mt-6" />
  </Card>
);

export default SkeletonCard;
