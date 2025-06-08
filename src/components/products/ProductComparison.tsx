
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Scale } from 'lucide-react';
import { Product } from '@/lib/types';

interface ProductComparisonProps {
  products: Product[];
  onRemoveProduct: (productId: string) => void;
  onClose: () => void;
}

const ProductComparison: React.FC<ProductComparisonProps> = ({ products, onRemoveProduct, onClose }) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Scale className="h-6 w-6" />
              Product Comparison
            </h2>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => onRemoveProduct(product.id)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="space-y-4">
                  <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded-lg" />
                    ) : (
                      <div className="text-gray-400">No Image</div>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold">PKR {product.price.toLocaleString()}</span>
                    </div>
                    
                    {product.moq && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">MOQ:</span>
                        <span>{product.moq} pieces</span>
                      </div>
                    )}
                    
                    {product.categories && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <Badge variant="secondary">{product.categories.name}</Badge>
                      </div>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductComparison;
