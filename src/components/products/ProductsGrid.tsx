
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import EmptyProductsState from '@/components/ui/EmptyProductsState';

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      <div className="text-center py-8">
        <p className="text-gray-600 font-poppins">
          Showing {products.length} products
        </p>
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 max-w-md mx-auto">
          <p className="text-sm text-green-700 font-poppins">
            💡 <strong>Tip:</strong> Use filters above to narrow down your search and find exactly what you need!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductsGrid;
