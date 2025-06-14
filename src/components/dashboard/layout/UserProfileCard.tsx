
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Profile } from '@/lib/types';

interface UserProfileCardProps {
  profile: Profile | null | undefined;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ profile }) => {
  if (!profile) {
    return (
      <div className="mb-6 flex flex-col items-center p-4 bg-pakistani_green-50 dark:bg-slate-800 rounded-lg">
        <Skeleton className="h-16 w-16 rounded-full mb-3" />
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  const getRoleVariant = () => {
    switch (profile.role) {
      case 'admin':
        return 'info';
      case 'wholesaler':
      case 'seller':
        return 'success';
      case 'pending':
        return 'secondary'; // Changed from 'pending' (yellow) to 'secondary' (gray)
      default:
        return 'secondary';
    }
  };

  return (
    <div className="mb-6 flex flex-col items-center p-4 bg-pakistani_green-50 dark:bg-slate-800 rounded-lg">
      <Avatar className="h-16 w-16 border-2 border-pakistani_green-100 dark:border-slate-700 mb-3">
        <AvatarFallback className="bg-pakistani_green-700 text-white text-xl dark:bg-pakistani_green-600">
          {profile.email?.substring(0, 2).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="text-center">
        <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">{profile.email?.split('@')[0]}</p>
        <Badge variant={getRoleVariant()} className="capitalize">
          {profile.role}
        </Badge>
      </div>
    </div>
  );
};

export default UserProfileCard;
