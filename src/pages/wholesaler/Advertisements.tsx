
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { getAdsByWholesaler, Ad } from '@/lib/supabase';
import { getProductsByWholesaler } from '@/lib/products';
import { Plus, Package } from 'lucide-react';
import AdCard from './ads/AdCard';
import CreateAdDialog from '@/components/ads/CreateAdDialog';
import EmptyState from './ads/EmptyState';

const Advertisements: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const data = await getAdsByWholesaler();
      setAds(data);
    } catch (error) {
      console.error('Failed to fetch advertisements:', error);
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
  const handleAdApproved = () => fetchAds(); // For admin to trigger refresh

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Advertisements</h1>
          <Button 
            onClick={handleCreateClick}
            className="bg-primary hover:bg-pakistani-green-800"
            disabled={products.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" /> Create Ad
          </Button>
        </div>
        
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
              <p className="text-sm text-yellow-700">
                Advertisements require admin approval before they appear on the platform.
              </p>
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
              <AdCard 
                key={ad.id} 
                ad={ad} 
                onEdit={handleCreateClick}
              />
            ))}
          </div>
        )}
      </div>

      <CreateAdDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        products={products}
        onAdCreated={handleAdCreated}
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
