
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/types';
import { Package, MapPin } from 'lucide-react';
import StarRating from '@/components/reviews/StarRating';
import VerifiedBadge from '@/components/reviews/VerifiedBadge';

interface ProductCardProps {
  product: Product & {
    avg_rating?: number;
    total_reviews?: number;
    shops?: {
      name: string;
      cities?: { name: string };
      is_verified?: boolean;
    };
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
        <div className="h-48 bg-gray-100 dark:bg-gray-700 relative">
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
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {product.categories && (
            <Badge className="absolute top-2 left-2 bg-blue-100 text-blue-800 border-blue-200">
              {product.categories.name}
            </Badge>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 font-poppins">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 font-poppins">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-2xl font-bold text-pakistani_green-700 font-poppins">
                PKR {product.price.toLocaleString()}
              </p>
              {product.moq && product.moq > 1 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 font-poppins">
                  MOQ: {product.moq} pieces
                </p>
              )}
            </div>
            
            {product.avg_rating && product.avg_rating > 0 && (
              <div className="flex items-center space-x-1">
                <StarRating rating={product.avg_rating} size="sm" />
                <span className="text-sm text-gray-600 dark:text-gray-300 font-poppins">
                  ({product.total_reviews || 0})
                </span>
              </div>
            )}
          </div>
          
          {product.shops && (
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-gray-200 font-poppins">
                    {product.shops.name}
                  </p>
                  {product.shops.cities && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="font-poppins">{product.shops.cities.name}</span>
                    </div>
                  )}
                </div>
                
                <VerifiedBadge isVerified={product.shops.is_verified || false} size="sm" />
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;
