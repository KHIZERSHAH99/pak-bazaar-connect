
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, BarChart3, PauseCircle, PlayCircle, TrendingUp, DollarSign } from 'lucide-react';
import { getAdsByWholesaler } from '@/lib/ads';
import { useToast } from '@/hooks/use-toast';
import type { Ad } from '@/lib/types';

const AdManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const { data: ads = [], isLoading, refetch } = useQuery({
    queryKey: ['wholesaler-ads'],
    queryFn: getAdsByWholesaler,
    refetchInterval: 30000
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, text: 'Pending Review' },
      active: { variant: 'default' as const, text: 'Active' },
      paused: { variant: 'outline' as const, text: 'Paused' },
      rejected: { variant: 'destructive' as const, text: 'Rejected' },
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const handlePauseResume = async (adId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      
      toast({
        title: `Ad ${newStatus === 'active' ? 'Resumed' : 'Paused'}`,
        description: `Your advertisement has been ${newStatus === 'active' ? 'resumed' : 'paused'}.`,
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ad status",
        variant: "destructive"
      });
    }
  };

  // Calculate stats from ads array
  const stats = {
    total: Array.isArray(ads) ? ads.length : 0,
    active: Array.isArray(ads) ? ads.filter((ad: Ad) => ad.status === 'active').length : 0,
    pending: Array.isArray(ads) ? ads.filter((ad: Ad) => ad.status === 'pending').length : 0,
    paused: Array.isArray(ads) ? ads.filter((ad: Ad) => ad.status === 'paused').length : 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Ad Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-24 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-poppins">Ad Management Dashboard</h2>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ads</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <PauseCircle className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paused</p>
                <p className="text-2xl font-bold">{stats.paused}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Advertisements</CardTitle>
            </CardHeader>
            <CardContent>
              {!Array.isArray(ads) || ads.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No advertisements created yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ads.map((ad: Ad) => (
                    <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {ad.image && (
                          <img 
                            src={ad.image} 
                            alt={ad.headline}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold">{ad.headline}</h3>
                          <p className="text-sm text-gray-600">
                            Created: {new Date(ad.created_at || '').toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {getStatusBadge(ad.status)}
                        
                        {(ad.status === 'active' || ad.status === 'paused') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePauseResume(ad.id, ad.status)}
                          >
                            {ad.status === 'active' ? (
                              <>
                                <PauseCircle className="h-4 w-4 mr-1" />
                                Pause
                              </>
                            ) : (
                              <>
                                <PlayCircle className="h-4 w-4 mr-1" />
                                Resume
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-lg">Total Impressions</h3>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                  <p className="text-sm text-gray-600">Coming Soon</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-lg">Click Rate</h3>
                  <p className="text-2xl font-bold text-green-600">0%</p>
                  <p className="text-sm text-gray-600">Coming Soon</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-lg">Conversions</h3>
                  <p className="text-2xl font-bold text-purple-600">0</p>
                  <p className="text-sm text-gray-600">Coming Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg">Total Spend</h3>
                  <p className="text-2xl font-bold text-yellow-600">Rs. 0</p>
                  <p className="text-sm text-gray-600">This Month</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg">Budget Remaining</h3>
                  <p className="text-2xl font-bold text-green-600">Rs. 0</p>
                  <p className="text-sm text-gray-600">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdManagementDashboard;
