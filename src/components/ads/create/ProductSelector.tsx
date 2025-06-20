
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

interface ProductSelectorProps {
  products: Product[];
  selectedProduct: string;
  onProductChange: (productId: string) => void;
  error?: string;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  selectedProduct,
  onProductChange,
  error
}) => {
  const selectedProductData = products.find(p => p.id === selectedProduct);

  return (
    <>
      <div>
        <Label htmlFor="product">Select Product to Promote *</Label>
        <Select value={selectedProduct} onValueChange={onProductChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a product from your shop" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                <div className="flex items-center gap-2">
                  {product.image && (
                    <img src={product.image} alt={product.name} className="w-8 h-8 object-cover rounded" />
                  )}
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">PKR {product.price}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>

      {selectedProductData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Selected Product</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            {selectedProductData.image && (
              <img 
                src={selectedProductData.image} 
                alt={selectedProductData.name}
                className="w-16 h-16 object-cover rounded"
              />
            )}
            <div>
              <h3 className="font-medium">{selectedProductData.name}</h3>
              <p className="text-sm text-gray-600">PKR {selectedProductData.price}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ProductSelector;
