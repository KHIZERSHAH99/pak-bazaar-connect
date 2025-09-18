
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="mb-6 flex flex-col items-center">
        <Skeleton className="h-16 w-16 rounded-full mb-3" />
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  return (
    <div className="mb-3 sm:mb-4 flex flex-col items-center p-3 sm:p-4 rounded-lg border border-border/50 bg-white/[0.31]">
      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary/20 mb-2">
        <AvatarFallback className="bg-primary text-xs sm:text-sm font-bold text-slate-50">
          {profile.email?.substring(0, 2).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="text-center">
        <p className="font-medium text-foreground mb-0.5 font-poppins truncate max-w-32 text-xs sm:text-sm">
          {profile.email?.split('@')[0]}
        </p>
        <Badge 
          variant={
            profile.role === 'admin' ? 'default' : 
            profile.role === 'wholesaler' || profile.role === 'seller' ? 'secondary' : 'outline'
          } 
          className="capitalize font-poppins text-[10px] sm:text-xs px-1.5 py-0"
        >
          {profile.role}
        </Badge>
      </div>
    </div>
  );
};

export default UserProfile;
