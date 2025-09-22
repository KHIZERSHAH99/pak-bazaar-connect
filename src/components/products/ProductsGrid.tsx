import React from 'react';
import { Loader2 } from 'lucide-react';
import AdUnit from '@/components/ads/AdUnit';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';

interface ProductsGridProps {
  products: Product[];
  loading: boolean;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ products, loading }) => {
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-pakistani_green-600 mx-auto mb-4" />
          <p className="text-gray-600 font-poppins">Loading products...</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-lg font-medium text-gray-700 mb-2 font-poppins">No products found</h3>
          <p className="text-gray-600 font-poppins mb-4">
            Try adjusting your search criteria or clearing the filters.
          </p>
          <p className="text-sm text-gray-500 font-poppins">
            If you're a wholesaler, you can add products from your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Product Grid - Better spacing and card sizes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
        {products.map((product, index) => (
          <React.Fragment key={product.id}>
            <ProductCard product={product} />
            
            {/* Insert horizontal ad banner after every 6 products */}
            {(index + 1) % 6 === 0 && index !== products.length - 1 && (
              <div className="col-span-full">
                <div className="bg-background/50 rounded-lg p-4 flex justify-center">
                  <AdUnit 
                    slotId="homepage-middle"
                    format="display"
                    size="leaderboard"
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground font-poppins">
          Showing {products.length} products
        </p>
      </div>
    </div>
  );
};

export default ProductsGrid;