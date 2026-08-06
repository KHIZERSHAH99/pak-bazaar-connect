import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductsGridProps {
  products: Product[];
  loading: boolean;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ products, loading }) => {
  const [sortBy, setSortBy] = useState('newest');

  const sortedProducts = React.useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case 'price-low': return sorted.sort((a, b) => a.price - b.price);
      case 'price-high': return sorted.sort((a, b) => b.price - a.price);
      case 'name': return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
      default: return sorted;
    }
  }, [products, sortBy]);

  const {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    canGoNext,
    canGoPrevious
  } = usePagination({ items: sortedProducts, itemsPerPage: 12 });
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-muted rounded-lg p-8">
          <h3 className="text-lg font-medium text-foreground mb-2 font-poppins">No products found</h3>
          <p className="text-muted-foreground font-poppins mb-4">
            Try adjusting your search criteria or clearing the filters.
          </p>
          <p className="text-sm text-muted-foreground font-poppins">
            If you're a wholesaler, you can add products from your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sort bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-poppins">
          {products.length} product{products.length !== 1 ? 's' : ''} found
        </p>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-low">Price: Low → High</SelectItem>
            <SelectItem value="price-high">Price: High → Low</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
        {currentItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground font-poppins">
          Showing {(currentPage - 1) * 12 + 1}-{Math.min(currentPage * 12, products.length)} of {products.length} products
        </p>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
      />
    </div>
  );
};

export default ProductsGrid;