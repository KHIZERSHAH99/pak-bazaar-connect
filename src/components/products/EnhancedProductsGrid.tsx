
import React from 'react';
import { Card } from '@/components/ui/card';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import SkeletonLoader from '@/components/ui/skeleton-loader';
import InfiniteScroll from '@/components/ui/infinite-scroll';
import { Package } from 'lucide-react';

interface EnhancedProductsGridProps {
  products: Product[];
  loading: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const EnhancedProductsGrid: React.FC<EnhancedProductsGridProps> = ({
  products,
  loading,
  hasMore = false,
  onLoadMore
}) => {
  // Show skeleton loader for initial loading
  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonLoader
            key={index}
            variant="card"
            height="h-80"
            className="rounded-lg"
          />
        ))}
      </div>
    );
  }

  // Show empty state
  if (!loading && products.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2 font-poppins">
          No products found
        </h3>
        <p className="text-gray-600 font-poppins">
          Try adjusting your search criteria or filters.
        </p>
      </Card>
    );
  }

  const content = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );

  // If infinite scroll is enabled, wrap with InfiniteScroll component
  if (onLoadMore) {
    return (
      <InfiniteScroll
        loading={loading}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        className="space-y-6"
      >
        {content}
      </InfiniteScroll>
    );
  }

  return content;
};

export default EnhancedProductsGrid;
