
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { requestRoleChange, UserRole } from '@/lib/supabase';

const Profile: React.FC = () => {
  const { profile, checkAuthStatus } = useAuth();
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
      toast({
        title: 'Request failed',
        description: error.message || 'Failed to submit role request',
        variant: 'destructive',
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'wholesaler':
        return 'bg-blue-100 text-blue-800';
      case 'seller':
        return 'bg-green-100 text-green-800';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-600 mt-2">
              Manage your account information and role settings
            </p>
          </div>
          
          <Card className="p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-xl font-semibold mb-2 md:mb-0">Account Information</h2>
              <Badge className={getRoleBadgeColor(profile.role)}>
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="text-gray-800 font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-gray-800 font-medium">
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Role Management</h2>
            <p className="text-gray-600 mb-6">
              You can switch between being a wholesaler or a seller. Role changes require admin approval.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Wholesaler</h3>
                    <p className="text-sm text-gray-600">Sell products to retailers</p>
                  </div>
                  {profile.role === 'wholesaler' && (
                    <Badge className="bg-green-100 text-green-800">Current</Badge>
                  )}
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-4">
                  <li>• Create and manage shops</li>
                  <li>• List products for sale</li>
                  <li>• Create promotional ads</li>
                  <li>• Fulfill retailer orders</li>
                </ul>
                {profile.role !== 'wholesaler' && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleRoleRequest('wholesaler')}
                    disabled={isRequesting || profile.role === 'pending'}
                  >
                    Request Wholesaler Role
                  </Button>
                )}
              </div>
              
              <div className="border rounded-lg p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Seller</h3>
                    <p className="text-sm text-gray-600">Purchase products from wholesalers</p>
                  </div>
                  {profile.role === 'seller' && (
                    <Badge className="bg-green-100 text-green-800">Current</Badge>
                  )}
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-4">
                  <li>• Browse wholesale catalogs</li>
                  <li>• Place bulk orders</li>
                  <li>• Track order status</li>
                  <li>• Manage inventory purchases</li>
                </ul>
                {profile.role !== 'seller' && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleRoleRequest('seller')}
                    disabled={isRequesting || profile.role === 'pending'}
                  >
                    Request Seller Role
                  </Button>
                )}
              </div>
            </div>
            
            {profile.role === 'pending' && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-md border border-yellow-200 text-yellow-800">
                <p className="font-medium">Your role request is pending approval</p>
                <p className="text-sm mt-1">
                  An administrator will review your request shortly. You'll get access to role-specific features once approved.
                </p>
              </div>
            )}
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
