import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Eye, Settings, TrendingUp, DollarSign, Users, Target, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import EnhancedCreateAdDialog from './EnhancedCreateAdDialog';
import { format } from 'date-fns';

interface Ad {
  id: string;
  headline: string;
  image?: string;
  status: 'pending' | 'approved' | 'active' | 'paused' | 'rejected';
  current_spend: number;
  total_orders: number;
  budget_cap: number;
  campaign_start_date?: string;
  campaign_end_date?: string;
  created_at: string;
  is_auto_stopped: boolean;
}

const ProfessionalAdManagement: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const queryClient = useQueryClient();

  const { data: ads = [], isLoading, error, refetch } = useQuery({
    queryKey: ['wholesaler-ads'],
    queryFn: async (): Promise<Ad[]> => {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('wholesaler_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ads:', error);
        throw error;
      }

      // Type cast the status field to match our interface
      return (data || []).map(ad => ({
        ...ad,
        status: ad.status as 'pending' | 'approved' | 'active' | 'paused' | 'rejected'
      }));
    },
  });

  const handleAdCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['wholesaler-ads'] });
    toast({
      title: "Success",
      description: "Advertisement created successfully!",
    });
  };

  const handleDeleteAd = async (adId: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ status: 'rejected' })
        .eq('id', adId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['wholesaler-ads'] });
      toast({
        title: "Success",
        description: "Advertisement deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete advertisement",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAds = ads.filter(ad => {
    if (selectedTab === 'all') return ad.status !== 'rejected';
    return ad.status === selectedTab;
  });

  const totalSpend = ads.reduce((sum, ad) => sum + (ad.current_spend || 0), 0);
  const totalOrders = ads.reduce((sum, ad) => sum + (ad.total_orders || 0), 0);
  const activeAds = ads.filter(ad => ad.status === 'active').length;

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error loading advertisements: {error.message}</p>
              <Button onClick={() => refetch()} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">Advertisement Campaigns</h1>
          <p className="text-gray-600 font-poppins">Manage your marketing campaigns and track performance</p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-pakistani_green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 font-poppins">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900 font-poppins">{activeAds}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 font-poppins">Total Spend</p>
                <p className="text-2xl font-bold text-gray-900 font-poppins">₨{totalSpend.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 font-poppins">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 font-poppins">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 font-poppins">Avg. ROI</p>
                <p className="text-2xl font-bold text-gray-900 font-poppins">
                  {totalSpend > 0 ? `${((totalOrders * 100) / totalSpend).toFixed(1)}%` : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-poppins">Your Campaigns</CardTitle>
          <CardDescription className="font-poppins">
            Manage and monitor your advertising campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" className="font-poppins">All</TabsTrigger>
              <TabsTrigger value="active" className="font-poppins">Active</TabsTrigger>
              <TabsTrigger value="pending" className="font-poppins">Pending</TabsTrigger>
              <TabsTrigger value="approved" className="font-poppins">Approved</TabsTrigger>
              <TabsTrigger value="paused" className="font-poppins">Paused</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pakistani_green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-poppins">Loading campaigns...</p>
                  </div>
                </div>
              ) : filteredAds.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 font-poppins mb-2">
                    {selectedTab === 'all' ? 'No campaigns yet' : `No ${selectedTab} campaigns`}
                  </h3>
                  <p className="text-gray-600 font-poppins mb-4">
                    Start promoting your products by creating your first advertisement campaign.
                  </p>
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Campaign
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredAds.map((ad) => (
                    <Card key={ad.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 font-poppins">
                                {ad.headline}
                              </h3>
                              <Badge className={getStatusColor(ad.status)}>
                                {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                              </Badge>
                              {ad.is_auto_stopped && (
                                <Badge variant="outline" className="text-orange-600 border-orange-200">
                                  Auto-stopped
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div>
                                <p className="text-sm text-gray-600 font-poppins">Spend</p>
                                <p className="text-lg font-semibold text-gray-900 font-poppins">
                                  ₨{ad.current_spend?.toLocaleString() || '0'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 font-poppins">Orders</p>
                                <p className="text-lg font-semibold text-gray-900 font-poppins">
                                  {ad.total_orders || 0}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 font-poppins">Budget</p>
                                <p className="text-lg font-semibold text-gray-900 font-poppins">
                                  ₨{ad.budget_cap?.toLocaleString() || 'Unlimited'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 font-poppins">Created</p>
                                <p className="text-lg font-semibold text-gray-900 font-poppins">
                                  {format(new Date(ad.created_at), 'MMM dd')}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button variant="outline" size="sm" className="font-poppins">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="font-poppins">
                              <Settings className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteAd(ad.id)}
                              className="font-poppins text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        {ad.image && (
                          <div className="mt-4">
                            <img 
                              src={ad.image} 
                              alt={ad.headline}
                              className="h-32 w-full object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <EnhancedCreateAdDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onAdCreated={handleAdCreated}
      />
    </div>
  );
};

export default ProfessionalAdManagement;
