
import React, { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/types';
import { Package, MapPin, Edit, Eye } from 'lucide-react'; // Corrected: Edit, Eye
import { Button } from '@/components/ui/button';
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
  showActions?: boolean;
  onEdit?: (productId: string) => void;
  onPreview?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ 
  product, 
  showActions = false, 
  onEdit, 
  onPreview 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    onEdit?.(product.id);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    onPreview?.(product.id);
  };

  return (
    <div className="group">
      <Link to={`/product/${product.id}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full group-hover:scale-[1.02]">
          <div className="h-48 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
            {product.image && !imageError ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 animate-pulse" />
                )}
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className={`h-full w-full object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-16 w-16 text-gray-400 dark:text-gray-500" />
              </div>
            )}
            
            {product.categories && (
              <Badge className="absolute top-2 left-2 bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200">
                {product.categories.name}
              </Badge>
            )}

            {product.is_active && (
              <Badge variant="success" className="absolute top-2 right-2"> {/* Use variant="success" for consistency */}
                Active
              </Badge>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 font-poppins text-gray-900 dark:text-gray-100">
              {product.name}
            </h3>
            
            {product.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 font-poppins">
                {product.description}
              </p>
            )}
            
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-2xl font-bold text-pakistani_green-700 dark:text-pakistani_green-400 font-poppins">
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
              <div className="border-t pt-3 dark:border-gray-600">
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

            {showActions && (
              <div className="flex space-x-2 mt-4 pt-3 border-t dark:border-gray-600">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" /> {/* Corrected: Edit */}
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" /> {/* Corrected: Eye */}
                  Preview
                </Button>
              </div>
            )}
          </div>
        </Card>
      </Link>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
