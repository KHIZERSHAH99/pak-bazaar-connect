
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Package, Heart, ShoppingCart, Eye, Verified } from 'lucide-react';
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
    
    // Import useCart hook dynamically to avoid dependency issues
    import('@/contexts/CartContext').then(({ useCart }) => {
      try {
        const { addToCart } = useCart();
        addToCart(product);
        
        // Show success notification
        import('@/hooks/use-toast').then(({ useToast }) => {
          const { toast } = useToast();
          toast({
            title: "Added to Cart",
            description: `${product.name} has been added to your cart.`,
          });
        });
      } catch (error) {
        console.log('Cart not available, using fallback');
      }
    }).catch(() => {
      console.log('Added to cart:', product.name);
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Toggle favorite logic here
    console.log('Toggled favorite:', product.name);
  };

  const getProductImageSrc = (image?: string) => {
    if (image && !image.includes('placeholder.svg')) {
      return image;
    }
    // Use a more appropriate placeholder for products
    return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&auto=format`;
  };

  return (
    <Link to={`/product/${product.id}`} className="block">
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:shadow-pakistani_green-200/50 h-full bg-white">
        {/* Product Image */}
        <div className="relative overflow-hidden">
          <img 
            src={getProductImageSrc(product.image)} 
            alt={product.name} 
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&auto=format`;
            }}
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <Button 
              variant="secondary" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 transition-opacity font-poppins bg-white/90 text-gray-900 hover:bg-white"
            >
              <Eye className="w-4 h-4 mr-1" />
              Quick View
            </Button>
          </div>

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.categories && (
              <Badge className="bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white shadow-sm font-poppins text-xs">
                {product.categories.name}
              </Badge>
            )}
            {product.verification_status === 'approved' && (
              <Badge className="bg-green-100 text-green-800 shadow-sm">
                <Verified className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            {product.verification_status === 'pending' && (
              <Badge className="bg-yellow-100 text-yellow-800 shadow-sm">
                Pending
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          {showFavorite && (
            <button
              onClick={handleToggleFavorite}
              className="absolute top-3 right-3 bg-white/90 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <Heart className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4 space-y-3 flex-1 flex flex-col">
          {/* Product Name */}
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-pakistani_green-600 transition-colors font-poppins line-clamp-2 flex-shrink-0">
            {product.name}
          </h3>
          
          {/* Price */}
          <div className="flex items-center justify-between flex-shrink-0">
            <span className="text-2xl font-bold text-pakistani_green-600 font-poppins">
              PKR {product.price.toLocaleString()}
            </span>
            {product.moq && product.moq > 1 && (
              <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">
                MOQ: {product.moq}
              </Badge>
            )}
          </div>

          {/* Supplier Info */}
          <div className="space-y-2 flex-grow">
            {product.shops && (
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700 font-poppins">
                  {product.shops.name}
                </p>
                <div className="flex items-center text-xs text-yellow-500">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  <span>4.8</span>
                </div>
              </div>
            )}
            
            {product.shops?.cities && (
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="font-poppins">{product.shops.cities.name}, {product.shops.cities.province}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-600 font-poppins line-clamp-2 flex-shrink-0">
              {product.description}
            </p>
          )}

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
              <Button 
                variant="outline" 
                size="sm"
                className="px-3 border-pakistani_green-200 text-pakistani_green-600 hover:bg-pakistani_green-50"
              >
                <Package className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;
