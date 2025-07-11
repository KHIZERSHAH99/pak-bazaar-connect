
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar,
  CreditCard,
  ShoppingBag,
  Shield,
  Star,
  Edit,
  Camera,
  TrendingUp,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextFixed';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProfileImageUpload from './ProfileImageUpload';
import ProfileEditor from './ProfileEditor';
import BusinessDetails from './BusinessDetails';
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
      }, { totalOrders: 0, completedOrders: 0, pendingOrders: 0 }) || { totalOrders: 0, completedOrders: 0, pendingOrders: 0 };

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
  };

  if (!profile) return null;

  const completionRate = orderStats.totalOrders > 0 ? 
    Math.round((orderStats.completedOrders / orderStats.totalOrders) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Enhanced Header Section */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pakistani_green-700 to-pakistani_green-500 bg-clip-text text-transparent font-poppins">
              User Profile
            </h1>
            <p className="text-muted-foreground font-poppins text-lg max-w-2xl mx-auto">
              Manage your account information, preferences, and view your business analytics
            </p>
          </div>

          {/* Enhanced Profile Overview */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Profile Image & Quick Info */}
            <div className="xl:col-span-4 space-y-6">
              <Card variant="elevated" className="p-6 lg:p-8 text-center">
                <div className="space-y-6">
                  <div className="relative inline-block">
                    <Avatar className="h-24 w-24 lg:h-28 lg:w-28 border-4 border-pakistani_green-100 dark:border-pakistani_green-800 shadow-xl">
                      <AvatarFallback className="bg-gradient-to-br from-pakistani_green-500 to-pakistani_green-600 text-white text-2xl lg:text-3xl font-bold">
                        {profile.email?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute -bottom-2 -right-2 bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white rounded-full p-2 shadow-lg transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <h2 className="text-xl lg:text-2xl font-bold text-foreground font-poppins">
                      {profile.email?.split('@')[0] || 'User'}
                    </h2>
                    <Badge 
                      variant={profile.role === 'admin' ? 'default' : 'secondary'}
                      className="text-sm px-4 py-1 font-poppins capitalize font-medium"
                    >
                      {profile.role}
                    </Badge>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="default" size="sm" className="shadow-md">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Security
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Account Status Card */}
              <Card variant="elevated" className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-pakistani_green-600" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        {profile.verification_status === 'approved' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-poppins">Verification</p>
                      <p className="text-sm font-medium font-poppins capitalize">
                        {profile.verification_status || 'pending'}
                      </p>
                    </div>
                    
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        {profile.is_suspended ? (
                          <Shield className="h-5 w-5 text-red-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-poppins">Status</p>
                      <p className="text-sm font-medium font-poppins">
                        {profile.is_suspended ? 'Suspended' : 'Active'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Overview */}
            <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Total Orders */}
              <Card variant="elevated" className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-poppins">Total Orders</p>
                    <p className="text-2xl lg:text-3xl font-bold text-foreground font-poppins">
                      {loading ? '...' : orderStats.totalOrders}
                    </p>
                    <div className="flex items-center text-xs text-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span className="font-poppins">All time</span>
                    </div>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-800/30 p-4 rounded-2xl">
                    <ShoppingBag className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </Card>

              {/* Completed Orders */}
              <Card variant="elevated" className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-poppins">Completed</p>
                    <p className="text-2xl lg:text-3xl font-bold text-foreground font-poppins">
                      {loading ? '...' : orderStats.completedOrders}
                    </p>
                    <div className="flex items-center text-xs text-green-600">
                      <span className="font-poppins">{completionRate}% success rate</span>
                    </div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-800/30 p-4 rounded-2xl">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </Card>

              {/* Account Type */}
              <Card variant="elevated" className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-poppins">Account Type</p>
                    <Badge 
                      variant={profile.role === 'admin' ? 'default' : 'secondary'}
                      className="text-lg px-4 py-2 font-poppins capitalize font-semibold"
                    >
                      {profile.role}
                    </Badge>
                    <p className="text-xs text-muted-foreground font-poppins">
                      Member since {new Date(profile.created_at).getFullYear()}
                    </p>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-800/30 p-4 rounded-2xl">
                    <Star className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Main Content Sections */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-8">
              <AccountInfo 
                email={profile.email}
                createdAt={profile.created_at}
              />
            </div>

            <div className="space-y-8">
              <ProfileEditor 
                profile={profile}
                onProfileUpdate={handleProfileUpdate}
              />
            </div>
          </div>

          {/* Business Details */}
          {(profile.role === 'wholesaler' || profile.role === 'seller') && (
            <div className="space-y-8">
              <BusinessDetails 
                profile={profile}
                onUpdate={handleProfileUpdate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedUserProfile;
