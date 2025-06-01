
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { requestRoleChange, UserRole } from '@/lib/supabase';
import { ProfileSkeleton } from '@/contexts/AuthContext';
import { UserCog, Store, ShoppingBag, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AccountInfo from '@/components/profile/AccountInfo';
import RoleManagement from '@/components/profile/RoleManagement';

const Profile: React.FC = () => {
  const { profile, checkAuthStatus, loading } = useAuth();
  const { toast } = useToast();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRoleRequest = async (requestedRole: UserRole) => {
    if (!profile) return;
    
    try {
      setIsRequesting(true);
      await requestRoleChange(requestedRole);
      
      toast({
        title: 'Role request submitted',
        description: 'Your request has been submitted and is pending admin approval',
      });
      
      await checkAuthStatus();
    } catch (error: any) {
      console.error('Role request error:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const getRoleBadgeVariant = (role: string): "success" | "warning" | "pending" | "info" => {
    switch (role) {
      case 'admin':
        return 'info';
      case 'wholesaler':
        return 'success';
      case 'seller':
        return 'success';
      case 'pending':
      default:
        return 'pending';
    }
  };
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <UserCog className="h-5 w-5" />;
      case 'wholesaler':
        return <Store className="h-5 w-5" />;
      case 'seller':
        return <ShoppingBag className="h-5 w-5" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5" />;
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Skeleton className="h-8 md:h-10 w-48 mb-2" />
              <Skeleton className="h-5 md:h-6 w-80 md:w-96" />
            </div>
            
            <div className="mb-8">
              <Skeleton className="h-32 md:h-40 w-full" />
            </div>
            
            <div className="mt-8">
              <Skeleton className="h-40 md:h-48 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 font-poppins">Profile Not Found</h1>
            <p className="text-gray-600 mb-6 font-poppins">Unable to load your profile information at this time.</p>
            <Button onClick={() => checkAuthStatus()} className="bg-pakistani_green-700 hover:bg-pakistani_green-800 font-poppins">
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 font-poppins">My Profile</h1>
              <Badge variant={getRoleBadgeVariant(profile.role)} className="flex items-center gap-1 capitalize text-xs py-1 w-fit font-poppins">
                {getRoleIcon(profile.role)}
                {profile.role}
              </Badge>
            </div>
            <p className="text-gray-600 font-poppins text-sm md:text-base">
              Manage your account information and role settings
            </p>
          </div>
          
          <AccountInfo
            email={profile.email}
            createdAt={profile.created_at}
          />
          
          <RoleManagement
            currentRole={profile.role}
            isRequesting={isRequesting}
            onRoleRequest={handleRoleRequest}
          />
        </div>
      </div>
    </Layout>
  );
};

const ProfileWithAuth = () => (
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>
);

export default ProfileWithAuth;
