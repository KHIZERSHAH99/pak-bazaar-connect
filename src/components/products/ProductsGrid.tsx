
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
    return <EmptyProductsState />;
  }

  // Group products by category for better organization
  const groupedProducts = products.reduce((acc, product) => {
    const category = product.categories?.name || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 font-poppins">
              {category}
            </h3>
            <span className="text-sm text-gray-500 font-poppins">
              {categoryProducts.length} products
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ))}
      
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
