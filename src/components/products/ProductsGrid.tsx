
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
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
        {products.map((product, index) => (
          <React.Fragment key={product.id}>
            <ProductCard product={product} />
            {/* Insert ad after every 12 products */}
            {(index + 1) % 12 === 0 && index !== products.length - 1 && (
              <div className="col-span-1">
                <AdUnit 
                  slotId={`grid-ad-${Math.floor((index + 1) / 12)}`}
                  format="native"
                  size="medium-rectangle"
                  className="h-full"
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="text-center py-4">
        <p className="text-sm text-gray-600 font-poppins">
          Showing {products.length} products
        </p>
      </div>
    </div>
  );
};

export default ProductsGrid;
