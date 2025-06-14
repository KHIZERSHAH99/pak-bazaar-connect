
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
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    // Use a reliable placeholder image from Unsplash
    target.src = `https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=300&fit=crop&auto=format`;
  };

  const getImageSrc = () => {
    if (product.image && !product.image.includes('placeholder.svg')) {
      return product.image;
    }
    // Use category-based placeholder images
    return `https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=300&fit=crop&auto=format`;
  };

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full bg-card border-border">
        <div className="h-48 bg-muted relative">
          <img 
            src={getImageSrc()} 
            alt={product.name} 
            className="h-full w-full object-cover transition-opacity duration-300"
            onError={handleImageError}
            loading="lazy"
          />
          
          {product.categories && (
            <Badge className="absolute top-2 left-2 bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700">
              {product.categories.name}
            </Badge>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 font-poppins text-foreground">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2 font-poppins">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-2xl font-bold text-primary font-poppins">
                PKR {product.price.toLocaleString()}
              </p>
              {product.moq && product.moq > 1 && (
                <p className="text-xs text-muted-foreground font-poppins">
                  MOQ: {product.moq} pieces
                </p>
              )}
            </div>
            
            {product.avg_rating && product.avg_rating > 0 && (
              <div className="flex items-center space-x-1">
                <StarRating rating={product.avg_rating} size="sm" />
                <span className="text-sm text-muted-foreground font-poppins">
                  ({product.total_reviews || 0})
                </span>
              </div>
            )}
          </div>
          
          {product.shops && (
            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-foreground font-poppins">
                    {product.shops.name}
                  </p>
                  {product.shops.cities && (
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
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
