
import React from 'react';
import { Card } from '@/components/ui/card';
import { Product } from '@/lib/types';
import { Package, TrendingUp } from 'lucide-react';
import ProductCard from './ProductCard';

interface ProductsGridProps {
  products: Product[];
  loading: boolean;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ products, loading }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results header with enhanced styling */}
      <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-pakistani_green-600" />
          <div>
            <p className="text-lg font-semibold text-gray-900 font-poppins">
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </p>
            <p className="text-sm text-gray-600 font-poppins">
              Verified wholesale suppliers across Pakistan
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 font-poppins">Updated live</p>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-poppins">Active</span>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-gray-300">
          <Package className="h-20 w-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-700 mb-3 font-poppins">
            No products match your criteria
          </h3>
          <p className="text-gray-600 font-poppins mb-6">
            Try adjusting your search filters or browse all categories to discover amazing wholesale deals.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Electronics', 'Clothing', 'Food & Beverages', 'Home & Garden'].map((category) => (
              <span key={category} className="px-3 py-1 bg-pakistani_green-100 text-pakistani_green-700 rounded-full text-sm font-poppins cursor-pointer hover:bg-pakistani_green-200 transition-colors">
                {category}
              </span>
            ))}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
      
      {/* Load more indicator for future pagination */}
      {products.length > 0 && products.length % 12 === 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-gray-500 font-poppins">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span className="ml-2">Loading more products...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;
