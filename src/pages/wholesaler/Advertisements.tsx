
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { getAdsByWholesaler, pauseAd, resumeAd, Ad } from '@/lib/ads';
import { getProductsByWholesaler } from '@/lib/products';
import { Plus, Package, BarChart3 } from 'lucide-react';
import EnhancedAdCard from '@/components/ads/EnhancedAdCard';
import EnhancedCreateAdDialog from '@/components/ads/EnhancedCreateAdDialog';
import AdAnalyticsDashboard from '@/components/ads/AdAnalyticsDashboard';
import EmptyState from './ads/EmptyState';
import { useToast } from '@/hooks/use-toast';

const Advertisements: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [analyticsAd, setAnalyticsAd] = useState<Ad | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  
  const { toast } = useToast();

  const fetchAds = async () => {
    try {
      setLoading(true);
      const data = await getAdsByWholesaler();
      setAds(data);
    } catch (error) {
      console.error('Failed to fetch advertisements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load advertisements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getProductsByWholesaler();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  useEffect(() => {
    fetchAds();
    fetchProducts();
  }, []);

  const handleCreateClick = () => setIsDialogOpen(true);
  const handleDialogClose = () => setIsDialogOpen(false);
  const handleAdCreated = () => fetchAds();

  const handlePauseAd = async (adId: string) => {
    try {
      await pauseAd(adId);
      toast({
        title: 'Success',
        description: 'Advertisement paused successfully',
      });
      fetchAds();
    } catch (error) {
      console.error('Failed to pause ad:', error);
      toast({
        title: 'Error',
        description: 'Failed to pause advertisement',
        variant: 'destructive',
      });
    }
  };

  const handleResumeAd = async (adId: string) => {
    try {
      await resumeAd(adId);
      toast({
        title: 'Success',
        description: 'Advertisement resumed successfully',
      });
      fetchAds();
    } catch (error) {
      console.error('Failed to resume ad:', error);
      toast({
        title: 'Error',
        description: 'Failed to resume advertisement',
        variant: 'destructive',
      });
    }
  };

  const handleViewAnalytics = (adId: string) => {
    const ad = ads.find(a => a.id === adId);
    if (ad) {
      setAnalyticsAd(ad);
      setIsAnalyticsOpen(true);
    }
  };

  const getActiveAdsCount = () => ads.filter(ad => ad.status === 'active' && !ad.is_auto_stopped).length;
  const getTotalSpend = () => ads.reduce((sum, ad) => sum + ad.current_spend, 0);
  const getTotalOrders = () => ads.reduce((sum, ad) => sum + ad.total_orders, 0);

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Advertisement Campaigns</h1>
            <p className="text-gray-600 mt-1">Manage your Cost Per Order (CPO) campaigns</p>
          </div>
          <Button 
            onClick={handleCreateClick}
            className="bg-primary hover:bg-pakistani-green-800"
            disabled={products.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" /> Create Campaign
          </Button>
        </div>

        {/* Summary Stats */}
        {ads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Active Campaigns</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{getActiveAdsCount()}</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Total Orders</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{getTotalOrders()}</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-800">Total Spend</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                PKR {getTotalSpend().toLocaleString()}
              </div>
            </div>
          </div>
        )}
        
        {products.length === 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <Package className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-blue-700">
                  You need to add products to your shop before creating advertisements. 
                  <a href="/dashboard/products" className="underline ml-1">Add products now</a>
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Cost Per Order (CPO) Campaign
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>• You only pay when customers place orders through your ads</p>
                <p>• Campaigns stop automatically when budget or time limit is reached</p>
                <p>• Track real-time performance and adjust budgets as needed</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : ads.length === 0 ? (
          <EmptyState onCreateClick={handleCreateClick} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <EnhancedAdCard 
                key={ad.id} 
                ad={ad}
                onPause={handlePauseAd}
                onResume={handleResumeAd}
                onViewAnalytics={handleViewAnalytics}
              />
            ))}
          </div>
        )}
      </div>

      <EnhancedCreateAdDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onAdCreated={handleAdCreated}
      />

      <AdAnalyticsDashboard
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        ad={analyticsAd}
      />
    </DashboardLayout>
  );
};

const AdvertisementsWithAuth = () => (
  <ProtectedRoute allowedRoles={['wholesaler']}>
    <Advertisements />
  </ProtectedRoute>
);

export default AdvertisementsWithAuth;
