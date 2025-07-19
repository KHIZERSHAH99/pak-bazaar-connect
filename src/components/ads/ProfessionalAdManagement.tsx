
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  getWholesalerAds, 
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
  Target,
  Plus,
  Settings,
  Filter,
  Download
} from 'lucide-react';
import EnhancedCreateAdDialog from './EnhancedCreateAdDialog';
import AdAnalyticsDashboard from './AdAnalyticsDashboard';

const ProfessionalAdManagement: React.FC = () => {
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const { data: ads = [], isLoading, refetch } = useQuery({
    queryKey: ['wholesaler-ads'],
    queryFn: getWholesalerAds,
  });

  const handlePauseAd = async (adId: string) => {
    setActionLoading(adId);
    try {
      await pauseAd(adId);
      refetch();
      toast({
        title: "Campaign Paused",
        description: "Your advertising campaign has been paused successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to pause campaign",
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
        title: "Campaign Resumed",
        description: "Your advertising campaign has been resumed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resume campaign",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Campaign,Status,Spend,Orders,Created\n"
      + ads.map(ad => `${ad.headline},${ad.status},${ad.current_spend || 0},${ad.total_orders || 0},${new Date(ad.created_at).toLocaleDateString()}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ad_campaigns.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Complete",
      description: "Your campaign data has been exported successfully.",
    });
  };

  const handleViewDetails = (ad: Ad) => {
    setSelectedAd(ad);
    setShowAnalytics(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paused': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `https://sxzxyuxtqqflahzncfre.supabase.co/storage/v1/object/public/ad_images/${imagePath}`;
  };

  // Calculate summary stats
  const totalAds = ads.length;
  const activeAds = ads.filter(ad => ad.status === 'active').length;
  const pendingAds = ads.filter(ad => ad.status === 'pending').length;
  const pausedAds = ads.filter(ad => ad.status === 'paused').length;
  const totalSpend = ads.reduce((sum, ad) => sum + (ad.current_spend || 0), 0);
  const totalOrders = ads.reduce((sum, ad) => sum + (ad.total_orders || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">Advertisement Management</h1>
          <p className="text-gray-600 font-poppins">Monitor and optimize your advertising campaigns</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Filter", description: "Filtering functionality coming soon!" })}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            className="bg-pakistani_green-600 hover:bg-pakistani_green-700"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{totalAds}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-3xl font-bold text-green-600">{activeAds}</p>
                <p className="text-xs text-green-600 mt-1">Currently running</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Play className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spend</p>
                <p className="text-3xl font-bold text-pakistani_green-600">PKR {totalSpend.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <div className="h-12 w-12 bg-pakistani_green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-pakistani_green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Orders Generated</p>
                <p className="text-3xl font-bold text-orange-600">{totalOrders}</p>
                <p className="text-xs text-gray-500 mt-1">From campaigns</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex justify-between items-center">
            <CardTitle className="font-poppins text-lg">Campaign Overview</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">View:</span>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {ads.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 font-poppins mb-2">No campaigns yet</h3>
              <p className="text-gray-500 font-poppins mb-6">Create your first advertising campaign to start promoting your products</p>
              <Button 
                className="bg-pakistani_green-600 hover:bg-pakistani_green-700"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Campaign
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {ads.map((ad) => (
                <div key={ad.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        {ad.image && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                            <img 
                              src={getImageUrl(ad.image)} 
                              alt={ad.headline}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "https://via.placeholder.com/64x64?text=AD";
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">{ad.headline}</h3>
                            <Badge className={`${getStatusColor(ad.status)} font-medium`}>
                              {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Created on {new Date(ad.created_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Impressions</p>
                          <p className="text-2xl font-bold text-gray-900">0</p>
                          <p className="text-xs text-gray-500">Views</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Clicks</p>
                          <p className="text-2xl font-bold text-blue-600">0</p>
                          <p className="text-xs text-gray-500">CTR: 0%</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Orders</p>
                          <p className="text-2xl font-bold text-orange-600">{ad.total_orders || 0}</p>
                          <p className="text-xs text-gray-500">Conversions</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Spend</p>
                          <p className="text-2xl font-bold text-pakistani_green-600">PKR {(ad.current_spend || 0).toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Cost</p>
                        </div>
                      </div>

                      {/* Budget Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">Budget Usage</span>
                          <span className="text-gray-600">
                            PKR {(ad.current_spend || 0).toLocaleString()} / PKR {(ad.budget_cap || 0).toLocaleString()}
                          </span>
                        </div>
                        <Progress 
                          value={ad.budget_cap ? (ad.current_spend || 0) / ad.budget_cap * 100 : 0} 
                          className="h-2" 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-6">
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
                        className="text-pakistani_green-600 hover:text-pakistani_green-700"
                        onClick={() => handleViewDetails(ad)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-700"
                        onClick={() => toast({ title: "Settings", description: "Campaign settings coming soon!" })}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Settings
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Ad Dialog */}
      <EnhancedCreateAdDialog 
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          setShowCreateDialog(false);
          refetch();
        }}
      />

      {/* Analytics Dashboard */}
      <AdAnalyticsDashboard 
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        ad={selectedAd}
      />
    </div>
  );
};

export default ProfessionalAdManagement;
