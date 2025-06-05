
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

interface VerifiedBadgeProps {
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ isVerified, size = 'md' }) => {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Badge 
      className={`bg-green-100 text-green-800 border-green-200 ${sizeClasses[size]} font-poppins flex items-center gap-1`}
    >
      <CheckCircle className={iconSizes[size]} />
      Verified
    </Badge>
  );
};

export default VerifiedBadge;
