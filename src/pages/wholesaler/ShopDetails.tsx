
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Store } from 'lucide-react';

import ShopDetailsHeader from '@/components/shop/details/ShopDetailsHeader';
import ShopInformationCard from '@/components/shop/details/ShopInformationCard';
import ShopProductsSection from '@/components/shop/details/ShopProductsSection';
import ShopStatisticsCard from '@/components/shop/details/ShopStatisticsCard';
import ShopQuickActionsCard from '@/components/shop/details/ShopQuickActionsCard';

const ShopDetails: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();

  const { data: shop, isLoading, error } = useQuery({
    queryKey: ['shop', shopId],
    queryFn: async () => {
      if (!shopId) throw new Error('Shop ID is required');
      
      const { data, error: shopError } = await supabase
        .from('shops')
        .select(`
          *,
          cities (
            name,
            province
          )
        `)
        .eq('id', shopId)
        .single();
      
      if (shopError) throw shopError;
      return data;
    },
    enabled: !!shopId,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['shop-products', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      const { data, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('shop_id', shopId)
        .eq('is_active', true); // Only active products for this shop
      
      if (productsError) throw productsError;
      return data || [];
    },
    enabled: !!shopId,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-4 md:p-6">
          <Skeleton className="h-10 w-3/4 mb-4" /> {/* Header skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-40 w-full" /> {/* Shop info card skeleton */}
              <Skeleton className="h-64 w-full" /> {/* Products section skeleton */}
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" /> {/* Stats card skeleton */}
              <Skeleton className="h-48 w-full" /> {/* Quick actions skeleton */}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !shop) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Store className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Shop Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The shop you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/dashboard/shops')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shops
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ShopDetailsHeader shop={shop} onBack={() => navigate('/dashboard/shops')} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ShopInformationCard shop={shop} />
            <ShopProductsSection 
              products={products} 
              productsLoading={productsLoading}
              shopId={shopId}
            />
          </div>

          <div className="space-y-6">
            <ShopStatisticsCard shop={shop} productsCount={products?.length || 0} />
            <ShopQuickActionsCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const ShopDetailsWithAuth = () => (
  <ProtectedRoute allowedRoles={['wholesaler']}>
    <ShopDetails />
  </ProtectedRoute>
);

export default ShopDetailsWithAuth;

