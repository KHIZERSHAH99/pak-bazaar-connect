
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield } from 'lucide-react';

interface VerifiedBadgeProps {
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ 
  isVerified, 
  size = 'md', 
  showText = true 
}) => {
  if (!isVerified) return null;

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <Badge className={`bg-green-100 text-green-800 border-green-200 ${textSizes[size]} flex items-center gap-1`}>
      <CheckCircle className={`${iconSizes[size]} text-green-600`} />
      {showText && 'Verified'}
    </Badge>
  );
};

export default VerifiedBadge;
