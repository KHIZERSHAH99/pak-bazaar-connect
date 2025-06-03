
import React from 'react';
import { Card } from '@/components/ui/card';
import { Product } from '@/lib/types';
import { Package } from 'lucide-react';
import ProductCard from './ProductCard';

interface ProductsGridProps {
  products: Product[];
  loading: boolean;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ products, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <p className="text-gray-600 font-poppins">
          {products.length} product{products.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {products.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2 font-poppins">No products found</h3>
          <p className="text-gray-600 font-poppins">Try adjusting your search criteria or browse all categories.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
};

export default ProductsGrid;
