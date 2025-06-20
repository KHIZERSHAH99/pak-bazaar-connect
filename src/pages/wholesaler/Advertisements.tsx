
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { getAdsByWholesaler, pauseAd, resumeAd, Ad } from '@/lib/ads';
import { getProductsByWholesaler } from '@/lib/products';
import { Plus } from 'lucide-react';
import EnhancedCreateAdDialog from '@/components/ads/EnhancedCreateAdDialog';
import AdAnalyticsDashboard from '@/components/ads/AdAnalyticsDashboard';
import EmptyState from './ads/EmptyState';
import AdsSummaryCards from './ads/AdsSummaryCards';
import AdsInfoBanner from './ads/AdsInfoBanner';
import AdsGrid from './ads/AdsGrid';
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

        {ads.length > 0 && <AdsSummaryCards ads={ads} />}
        
        <AdsInfoBanner hasProducts={products.length > 0} />

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : ads.length === 0 ? (
          <EmptyState onCreateClick={handleCreateClick} />
        ) : (
          <AdsGrid 
            ads={ads}
            onPause={handlePauseAd}
            onResume={handleResumeAd}
            onViewAnalytics={handleViewAnalytics}
          />
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
