import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  getAdsByWholesaler, 
  pauseAd, 
  resumeAd,
  type Ad 
} from '@/lib/ads';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  DollarSign, 
  Play, 
  Pause,
  BarChart3,
  Calendar,
  Target
} from 'lucide-react';

const AdManagementDashboard: React.FC = () => {
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data: ads = [], isLoading, refetch } = useQuery({
    queryKey: ['wholesaler-ads'],
    queryFn: getAdsByWholesaler,
  });

  const handlePauseAd = async (adId: string) => {
    setActionLoading(adId);
    try {
      await pauseAd(adId);
      refetch();
      toast({
        title: "Ad Paused",
        description: "Your ad has been paused successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to pause ad",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeAd = async (adId: string) => {
    setActionLoading(adId);
    try {
      await resumeAd(adId);
      refetch();
      toast({
        title: "Ad Resumed",
        description: "Your ad has been resumed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resume ad",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate summary stats
  const totalAds = ads.length;
  const activeAds = ads.filter(ad => ad.status === 'active').length;
  const pendingAds = ads.filter(ad => ad.status === 'pending').length;
  const pausedAds = ads.filter(ad => ad.status === 'paused').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Ads</p>
                <p className="text-2xl font-bold text-gray-900">{totalAds}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-pakistani_green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{activeAds}</p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingAds}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Paused</p>
                <p className="text-2xl font-bold text-gray-600">{pausedAds}</p>
              </div>
              <Pause className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ads List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-poppins">Advertisement Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {ads.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-poppins">No advertisements yet</p>
              <p className="text-sm text-gray-400 font-poppins">Create your first ad to start promoting your products</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ads.map((ad) => (
                <Card key={ad.id} className="border-l-4 border-l-pakistani_green-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{ad.headline}</h3>
                          <Badge className={getStatusColor(ad.status)}>
                            {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                          </Badge>
                        </div>

                        {ad.image && (
                          <div className="w-32 h-20 rounded-md overflow-hidden">
                            <img 
                              src={ad.image} 
                              alt={ad.headline}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">Created</p>
                            <p className="text-gray-600">
                              {new Date(ad.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Impressions</p>
                            <p className="text-gray-600">0</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Clicks</p>
                            <p className="text-gray-600">0</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Spend</p>
                            <p className="text-gray-600">PKR 0</p>
                          </div>
                        </div>

                        {/* Mock Performance Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Click Rate</span>
                              <span>0%</span>
                            </div>
                            <Progress value={0} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Budget Used</span>
                              <span>0%</span>
                            </div>
                            <Progress value={0} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Performance</span>
                              <span>Good</span>
                            </div>
                            <Progress value={75} className="h-2" />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {ad.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePauseAd(ad.id)}
                            disabled={actionLoading === ad.id}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        ) : ad.status === 'paused' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResumeAd(ad.id)}
                            disabled={actionLoading === ad.id}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        ) : null}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-pakistani_green-600"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdManagementDashboard;