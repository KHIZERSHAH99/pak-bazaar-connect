
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Package, Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  showFavorite?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  showAddToCart = true, 
  showFavorite = true 
}) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Add to cart logic here
    console.log('Added to cart:', product.name);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Toggle favorite logic here
    console.log('Toggled favorite:', product.name);
  };

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:shadow-pakistani_green-200/50 dark:hover:shadow-pakistani_green-900/50 h-full">
        {/* Product Image */}
        <div className="relative overflow-hidden">
          <img 
            src={product.image || "https://via.placeholder.com/400x300?text=Product"} 
            alt={product.name} 
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/400x300?text=Product";
            }}
          />
          
          {/* Category Badge */}
          {product.categories && (
            <Badge className="absolute top-3 left-3 bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins">
              {product.categories.name}
            </Badge>
          )}

          {/* Favorite Button */}
          {showFavorite && (
            <button
              onClick={handleToggleFavorite}
              className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Heart className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}

          {/* Quick View Button */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <Button 
              variant="secondary" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 transition-opacity font-poppins"
            >
              Quick View
            </Button>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-5 space-y-3 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-pakistani_green-600 transition-colors font-poppins line-clamp-2 flex-shrink-0">
            {product.name}
          </h3>
          
          {/* Price */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-xl font-bold text-pakistani_green-600 dark:text-pakistani_green-400 font-poppins">
              PKR {product.price.toLocaleString()}
            </span>
          </div>

          {/* Supplier Info */}
          <div className="space-y-2 flex-grow">
            {product.shops && (
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 font-poppins">
                {product.shops.name}
              </p>
            )}
            
            {product.shops?.cities && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="font-poppins">{product.shops.cities.name}, {product.shops.cities.province}</span>
              </div>
            )}
          </div>

          {/* MOQ & Verification */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
            {product.moq && product.moq > 1 && (
              <span className="font-poppins">MOQ: {product.moq} pcs</span>
            )}
            {product.verification_status === 'approved' && (
              <Badge variant="secondary" className="text-xs">
                <Package className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          {showAddToCart && (
            <div className="flex gap-2 mt-auto pt-3 flex-shrink-0">
              <Button 
                onClick={handleAddToCart}
                className="flex-1 bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white font-poppins"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;
