
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Product } from '@/lib/types';
import { Package, MapPin } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
        <div className="h-48 bg-gray-100">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/300x200?text=Product";
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 font-poppins line-clamp-2">{product.name}</h3>
          
          {product.categories && (
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
              {product.categories.name}
            </span>
          )}
          
          <p className="text-2xl font-bold text-primary mb-2 font-poppins">
            PKR {product.price.toLocaleString()}
          </p>
          
          {product.moq && product.moq > 1 && (
            <p className="text-sm text-gray-600 mb-2 font-poppins">
              MOQ: {product.moq} pieces
            </p>
          )}
          
          {product.shops && (
            <div className="border-t pt-3 mt-3">
              <p className="font-medium text-gray-800 font-poppins">{product.shops.name}</p>
              {product.shops.cities && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="font-poppins">{product.shops.cities.name}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;
