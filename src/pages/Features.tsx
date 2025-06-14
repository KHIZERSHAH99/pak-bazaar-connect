
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import QuoteManager from '@/components/quotes/QuoteManager';
import ProductComparison from '@/components/products/ProductComparison';
import WishlistManager from '@/components/wishlist/WishlistManager';
import EnhancedMessaging from '@/components/messaging/EnhancedMessaging';
import OrderManagement from '@/components/orders/OrderManagement';
import { demoProducts } from '@/data/demoProducts';

const Features: React.FC = () => {
  const [comparisonProducts, setComparisonProducts] = useState(demoProducts.slice(0, 3));
  const [wishlistItems, setWishlistItems] = useState(demoProducts.slice(0, 5));

  const categories = Array.from(new Set(demoProducts.map(p => p.category)));
  const locations = Array.from(new Set(demoProducts.map(p => p.location)));

  const handleSearch = (filters: any) => {
    console.log('Search filters:', filters);
  };

  const handleRemoveFromComparison = (productId: string) => {
    setComparisonProducts(comparisonProducts.filter(p => p.id !== productId));
  };

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlistItems(wishlistItems.filter(p => p.id !== productId));
  };

  const handleAddToCart = (product: any) => {
    console.log('Added to cart:', product);
  };

  const handleShare = (product: any) => {
    console.log('Shared product:', product);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">Platform Features</h1>
          <p className="text-gray-600 font-poppins">Explore the comprehensive features designed for B2B e-commerce</p>
        </div>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="search">Advanced Search</TabsTrigger>
            <TabsTrigger value="quotes">Quote Management</TabsTrigger>
            <TabsTrigger value="comparison">Product Comparison</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="messaging">Messaging</TabsTrigger>
            <TabsTrigger value="orders">Order Management</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <AdvancedSearch
              onSearch={handleSearch}
              onClear={() => console.log('Cleared filters')}
              categories={categories}
              locations={locations}
            />
          </TabsContent>

          <TabsContent value="quotes" className="space-y-6">
            <QuoteManager userRole="buyer" />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <ProductComparison
              products={comparisonProducts}
              onRemoveProduct={handleRemoveFromComparison}
              onClearAll={() => setComparisonProducts([])}
            />
          </TabsContent>

          <TabsContent value="wishlist" className="space-y-6">
            <WishlistManager
              wishlistItems={wishlistItems}
              onRemoveFromWishlist={handleRemoveFromWishlist}
              onAddToCart={handleAddToCart}
              onShare={handleShare}
            />
          </TabsContent>

          <TabsContent value="messaging" className="space-y-6">
            <EnhancedMessaging />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrderManagement userRole="buyer" />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Features;
