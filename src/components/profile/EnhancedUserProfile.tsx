import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Shield, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProfileEditor from './ProfileEditor';
import BusinessDetailsEditor from './BusinessDetailsEditor';
import AccountInfo from './AccountInfo';

const EnhancedUserProfile: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchOrderStats();
    }
  }, [profile]);

  const fetchOrderStats = async () => {
    if (!profile) return;
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('status')
        .eq('buyer_id', profile.id);

      if (error) throw error;

      const stats = orders?.reduce((acc, order) => {
        acc.totalOrders++;
        if (order.status === 'completed') acc.completedOrders++;
        if (order.status === 'pending') acc.pendingOrders++;
        return acc;
      }, {
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0
      }) || {
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0
      };

      setOrderStats(stats);
    } catch (error: any) {
      console.error('Error fetching order stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been successfully updated"
    });
    // Refresh profile data if needed
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-poppins">My Profile</h1>
            <p className="text-gray-600 dark:text-gray-300 font-poppins">
              Manage your account information and preferences
            </p>
          </div>

          {/* Profile Overview Cards - Updated to remove profile image */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center py-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-blue-100 dark:bg-blue-800/50 p-3 rounded-full">
                    <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-poppins">
                  {loading ? '...' : orderStats.totalOrders}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-poppins">Total Orders</p>
              </CardContent>
            </Card>

            <Card className="text-center py-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-green-100 dark:bg-green-800/50 p-3 rounded-full">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-poppins">
                  {loading ? '...' : orderStats.completedOrders}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-poppins">Completed</p>
              </CardContent>
            </Card>

            <Card className="text-center py-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-orange-100 dark:bg-orange-800/50 p-3 rounded-full">
                    <Star className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'} className="text-lg px-3 py-1 font-poppins capitalize">
                  {profile.role}
                </Badge>
                <p className="text-gray-600 dark:text-gray-300 font-poppins mt-2">Account Type</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Account Information */}
            <div className="space-y-6">
              <AccountInfo email={profile.email} createdAt={profile.created_at} />
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
              <ProfileEditor profile={profile} onProfileUpdate={handleProfileUpdate} />
            </div>
          </div>

          {/* Business Details (if applicable) */}
          {(profile.role === 'wholesaler' || profile.role === 'seller') && (
            <div className="space-y-6">
              <BusinessDetailsEditor profile={profile} onProfileUpdate={handleProfileUpdate} />
            </div>
          )}

          {/* Verification Status */}
          <Card className="overflow-hidden border-none shadow-md">
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 dark:from-indigo-600/30 dark:to-purple-600/30 backdrop-blur-sm p-4 md:p-6 border-b border-indigo-200/50 dark:border-indigo-700/50">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-800/50 p-3 rounded-full">
                  <Shield className="h-5 w-5 text-indigo-700 dark:text-indigo-300" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-semibold mb-1 font-poppins text-indigo-800 dark:text-indigo-100">
                    Verification Status
                  </h2>
                  <p className="text-indigo-700 dark:text-indigo-200 text-sm font-poppins">
                    Your account verification and security status
                  </p>
                </div>
              </div>
            </div>
            
            <CardContent className="p-4 md:p-6 bg-background/95 dark:bg-background/95">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border/50">
                  <Badge variant={profile.verification_status === 'approved' ? 'default' : 'secondary'} className="font-poppins">
                    {profile.verification_status || 'pending'}
                  </Badge>
                  <span className="font-medium text-foreground font-poppins">
                    Account Verification
                  </span>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border/50">
                  <Badge variant={profile.is_suspended ? 'destructive' : 'default'} className="font-poppins">
                    {profile.is_suspended ? 'Suspended' : 'Active'}
                  </Badge>
                  <span className="font-medium text-foreground font-poppins">
                    Account Status
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedUserProfile;