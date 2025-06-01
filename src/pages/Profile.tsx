
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { requestRoleChange, UserRole } from '@/lib/supabase';
import { ProfileSkeleton } from '@/contexts/AuthContext';
import { ArrowRight, Calendar, CheckCircle, Clock, HelpCircle, User, UserCog, Store, ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
      // Error toasts are now handled inside requestRoleChange function
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
            
            <Card>
              <CardHeader>
                <Skeleton className="h-6 md:h-8 w-48 md:w-64" />
                <Skeleton className="h-4 md:h-5 w-32 md:w-40" />
              </CardHeader>
              <CardContent>
                <ProfileSkeleton />
              </CardContent>
            </Card>
            
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 md:h-8 w-40 md:w-48" />
                  <Skeleton className="h-4 md:h-5 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-32 md:h-40 w-full" />
                    <Skeleton className="h-32 md:h-40 w-full" />
                  </div>
                </CardContent>
              </Card>
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
          
          <Card className="mb-8 overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
            <div className="bg-gradient-to-r from-pakistani_green-700 to-pakistani_green-600 p-4 md:p-6 text-white">
              <h2 className="text-lg md:text-xl font-semibold mb-2 font-poppins">Account Information</h2>
              <p className="text-white/80 text-sm font-poppins">Your personal account details</p>
            </div>
            
            <div className="p-4 md:p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-pakistani_green-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-pakistani_green-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-poppins">Email Address</p>
                    <p className="text-gray-800 font-medium font-poppins break-all">{profile.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-pakistani_green-100 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-pakistani_green-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-poppins">Member Since</p>
                    <p className="text-gray-800 font-medium font-poppins">
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="overflow-hidden border-none shadow-md">
            <div className="bg-gradient-to-r from-pakistani_green-700 to-pakistani_green-600 p-4 md:p-6 text-white">
              <h2 className="text-lg md:text-xl font-semibold mb-2 font-poppins">Role Management</h2>
              <p className="text-white/80 text-sm font-poppins">Choose your role to access platform features</p>
            </div>
            
            <div className="p-4 md:p-6">
              <p className="text-gray-600 mb-6 font-poppins text-sm md:text-base">
                Select your role to access specific features. Role changes require admin approval for security.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card className={`border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md ${profile.role === 'wholesaler' ? 'ring-2 ring-pakistani_green-500 bg-pakistani_green-50' : 'hover:border-pakistani_green-300'}`}>
                  <div className="p-4 md:p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${profile.role === 'wholesaler' ? 'bg-pakistani_green-100' : 'bg-gray-100'}`}>
                          <Store className={`h-6 w-6 ${profile.role === 'wholesaler' ? 'text-pakistani_green-700' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg font-poppins">Wholesaler</h3>
                          <p className="text-sm text-gray-600 font-poppins">Sell products to retailers</p>
                        </div>
                      </div>
                      {profile.role === 'wholesaler' && (
                        <Badge variant="success" className="flex items-center gap-1 font-poppins">
                          <CheckCircle className="h-3 w-3" />
                          Current
                        </Badge>
                      )}
                    </div>
                    
                    <ul className="text-sm text-gray-600 space-y-2 mb-4 ml-4 list-disc font-poppins">
                      <li>Create and manage shops</li>
                      <li>List products for sale</li>
                      <li>Create promotional ads</li>
                      <li>Fulfill retailer orders</li>
                    </ul>
                    
                    {profile.role !== 'wholesaler' && (
                      <Button 
                        variant="outline" 
                        className="w-full group font-poppins"
                        onClick={() => handleRoleRequest('wholesaler')}
                        disabled={isRequesting || profile.role === 'pending'}
                      >
                        Request Wholesaler Role
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    )}
                  </div>
                </Card>
                
                <Card className={`border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md ${profile.role === 'seller' ? 'ring-2 ring-pakistani_green-500 bg-pakistani_green-50' : 'hover:border-pakistani_green-300'}`}>
                  <div className="p-4 md:p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${profile.role === 'seller' ? 'bg-pakistani_green-100' : 'bg-gray-100'}`}>
                          <ShoppingBag className={`h-6 w-6 ${profile.role === 'seller' ? 'text-pakistani_green-700' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg font-poppins">Seller</h3>
                          <p className="text-sm text-gray-600 font-poppins">Purchase from wholesalers</p>
                        </div>
                      </div>
                      
                      {profile.role === 'seller' && (
                        <Badge variant="success" className="flex items-center gap-1 font-poppins">
                          <CheckCircle className="h-3 w-3" />
                          Current
                        </Badge>
                      )}
                    </div>
                    
                    <ul className="text-sm text-gray-600 space-y-2 mb-4 ml-4 list-disc font-poppins">
                      <li>Browse wholesale catalogs</li>
                      <li>Place bulk orders</li>
                      <li>Track order status</li>
                      <li>Manage inventory purchases</li>
                    </ul>
                    
                    {profile.role !== 'seller' && (
                      <Button 
                        variant="outline" 
                        className="w-full group font-poppins"
                        onClick={() => handleRoleRequest('seller')}
                        disabled={isRequesting || profile.role === 'pending'}
                      >
                        Request Seller Role
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
              
              {profile.role === 'pending' && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-md border border-yellow-200 text-yellow-800 animate-pulse">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium font-poppins">Your role request is pending approval</p>
                      <p className="text-sm mt-1 font-poppins">
                        An administrator will review your request shortly. You'll get access to role-specific features once approved.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
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
