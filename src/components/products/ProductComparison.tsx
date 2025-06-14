
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Star, MapPin, Building, Package, DollarSign } from 'lucide-react';
import { DemoProduct } from '@/data/demoProducts';

interface ProductComparisonProps {
  products: DemoProduct[];
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
}

const ProductComparison: React.FC<ProductComparisonProps> = ({
  products,
  onRemoveProduct,
  onClearAll
}) => {
  if (products.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2 font-poppins">No products to compare</h3>
        <p className="text-gray-600 font-poppins">Add products to your comparison to see them here.</p>
      </Card>
    );
  }

  const features = [
    { key: 'price', label: 'Price', icon: DollarSign },
    { key: 'minOrder', label: 'Minimum Order', icon: Package },
    { key: 'location', label: 'Location', icon: MapPin },
    { key: 'wholesaler', label: 'Wholesaler', icon: Building },
    { key: 'category', label: 'Category', icon: Package },
    { key: 'inStock', label: 'Stock Status', icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-poppins">Product Comparison</h2>
          <p className="text-gray-600 font-poppins">Compare up to 4 products side by side</p>
        </div>
        <Button variant="outline" onClick={onClearAll}>
          Clear All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Product Headers */}
          <div className="grid grid-cols-1 gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${products.length + 1}, minmax(250px, 1fr))` }}>
            <div className="p-4"></div>
            {products.map((product) => (
              <Card key={product.id} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => onRemoveProduct(product.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold mb-2 font-poppins line-clamp-2">{product.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Features */}
          <Card>
            <CardContent className="p-0">
              {features.map((feature, index) => (
                <div
                  key={feature.key}
                  className={`grid gap-4 p-4 ${index !== features.length - 1 ? 'border-b' : ''}`}
                  style={{ gridTemplateColumns: `repeat(${products.length + 1}, minmax(250px, 1fr))` }}
                >
                  <div className="flex items-center gap-2 font-medium text-gray-700">
                    <feature.icon className="h-4 w-4" />
                    <span className="font-poppins">{feature.label}</span>
                  </div>
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center">
                      {feature.key === 'price' && (
                        <span className="font-semibold text-pakistani_green-600 font-poppins">
                          PKR {product.price.toLocaleString()}
                        </span>
                      )}
                      {feature.key === 'minOrder' && (
                        <span className="font-poppins">{product.minOrder} units</span>
                      )}
                      {feature.key === 'location' && (
                        <span className="font-poppins">{product.location}</span>
                      )}
                      {feature.key === 'wholesaler' && (
                        <span className="font-poppins">{product.wholesaler}</span>
                      )}
                      {feature.key === 'category' && (
                        <Badge variant="outline" className="font-poppins">{product.category}</Badge>
                      )}
                      {feature.key === 'inStock' && (
                        <Badge
                          variant={product.inStock ? "default" : "destructive"}
                          className="font-poppins"
                        >
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid gap-4 mt-6" style={{ gridTemplateColumns: `repeat(${products.length + 1}, minmax(250px, 1fr))` }}>
            <div></div>
            {products.map((product) => (
              <div key={product.id} className="space-y-2">
                <Button
                  className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700"
                  disabled={!product.inStock}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparison;
