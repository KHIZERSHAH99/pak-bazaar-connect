
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import AdUnit from '@/components/ads/AdUnit';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';

interface ProductsGridProps {
  products: Product[];
  loading: boolean;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ products, loading }) => {
  const [productsPerRow, setProductsPerRow] = useState(6);
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

  useEffect(() => {
    const updateProductsPerRow = () => {
      const width = window.innerWidth;
      if (width < 640) setProductsPerRow(2); // mobile
      else if (width < 768) setProductsPerRow(3); // sm
      else if (width < 1024) setProductsPerRow(4); // md/lg
      else if (width < 1280) setProductsPerRow(5); // xl
      else setProductsPerRow(6); // 2xl
    };

    updateProductsPerRow();
    window.addEventListener('resize', updateProductsPerRow);
    return () => window.removeEventListener('resize', updateProductsPerRow);
  }, []);

  // Group products into rows
  const productRows: Product[][] = [];
  for (let i = 0; i < products.length; i += productsPerRow) {
    productRows.push(products.slice(i, Math.min(i + productsPerRow, products.length)));
  }

  return (
    <div className="space-y-4">
      {productRows.map((row, rowIndex) => (
        <React.Fragment key={`row-${rowIndex}`}>
          {/* Product Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
            {row.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {/* Fill empty cells in incomplete rows */}
            {row.length < productsPerRow && Array.from({ length: productsPerRow - row.length }).map((_, idx) => (
              <div key={`empty-${idx}`} className="hidden sm:block" />
            ))}
          </div>
          
          {/* Ad Row - After every 2 product rows */}
          {(rowIndex + 1) % 2 === 0 && rowIndex !== productRows.length - 1 && (
            <div className="w-full bg-gray-50 rounded-lg p-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
                {Array.from({ length: productsPerRow }).map((_, adIndex) => (
                  <div key={`ad-${rowIndex}-${adIndex}`} className="bg-white rounded-lg shadow-sm">
                    <AdUnit 
                      slotId={`grid-ad-${rowIndex}-${adIndex}`}
                      format="native"
                      size="medium-rectangle"
                      className="h-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
      
      <div className="text-center py-4">
        <p className="text-sm text-gray-600 font-poppins">
          Showing {products.length} products
        </p>
      </div>
    </div>
  );
};

export default ProductsGrid;
