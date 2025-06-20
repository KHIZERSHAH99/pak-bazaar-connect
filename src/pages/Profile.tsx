
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Badge } from '@/components/ui/badge';
import { UserCog, Store, ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AccountInfo from '@/components/profile/AccountInfo';
import ProfileImageUpload from '@/components/profile/ProfileImageUpload';
import ProfileEditor from '@/components/profile/ProfileEditor';
import BusinessDetails from '@/components/profile/BusinessDetails';
import VerificationStatus from '@/components/profile/VerificationStatus';
import RolePermissions from '@/components/profile/RolePermissions';

const Profile: React.FC = () => {
  const { profile, checkAuthStatus, loading } = useAuth();

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'wholesaler':
        return 'default';
      case 'seller':
        return 'default';
      default:
        return 'secondary';
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
      default:
        return <Store className="h-5 w-5" />;
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Skeleton className="h-64 w-full" />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
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
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 font-poppins">My Profile</h1>
              <Badge variant={getRoleBadgeVariant(profile.role)} className="flex items-center gap-1 capitalize text-xs py-1 w-fit font-poppins">
                {getRoleIcon(profile.role)}
                {profile.role}
              </Badge>
            </div>
            <p className="text-gray-600 font-poppins text-sm md:text-base">
              Manage your account information, business details, and preferences
            </p>
          </div>

          {/* Profile Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Image & Quick Info */}
            <div className="lg:col-span-1 space-y-6">
              <ProfileImageUpload 
                profile={profile}
                onImageUpdate={checkAuthStatus}
              />
              <VerificationStatus profile={profile} />
              <RolePermissions role={profile.role} />
            </div>

            {/* Right Column - Main Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              <AccountInfo
                email={profile.email}
                createdAt={profile.created_at}
              />
              
              <ProfileEditor 
                profile={profile}
                onProfileUpdate={checkAuthStatus}
              />

              {(profile.role === 'wholesaler' || profile.role === 'seller') && (
                <BusinessDetails 
                  profile={profile}
                  onUpdate={checkAuthStatus}
                />
              )}
            </div>
          </div>
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
