import React from 'react';
import { Loader2 } from 'lucide-react';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/ui/PaginationControls';

interface ProductsGridProps {
  products: Product[];
  loading: boolean;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ products, loading }) => {
  const {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    previousPage,
    canGoNext,
    canGoPrevious
  } = usePagination({ items: products, itemsPerPage: 12 });
  
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