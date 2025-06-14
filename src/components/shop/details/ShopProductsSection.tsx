
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/products/ProductCard'; // Assuming ProductCard can be used here

interface ShopProductsSectionProps {
  products: Product[] | undefined;
  productsLoading: boolean;
  shopId: string | undefined; // Needed for navigation or further specific actions if any
}

const ShopProductsSection: React.FC<ShopProductsSectionProps> = ({ products, productsLoading, shopId }) => {
  const navigate = useNavigate();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 font-poppins flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Products ({products?.length || 0})
        </h3>
        <Button 
          onClick={() => navigate('/dashboard/products')} // General link, might need to be more specific if managing products for *this* shop
          size="sm"
          className="bg-pakistani_green-700 hover:bg-pakistani_green-800 dark:bg-pakistani_green-600 dark:hover:bg-pakistani_green-700"
        >
          Manage Products
        </Button>
      </div>
      
      {productsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Displaying only a few products for brevity, full list on product management page */}
          {products.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-poppins">No products added for this shop yet.</p>
        </div>
      )}
    </Card>
  );
};

export default ShopProductsSection;
