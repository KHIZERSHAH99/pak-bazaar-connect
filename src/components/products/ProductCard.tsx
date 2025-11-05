
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Package, Heart, ShoppingCart, Eye, Verified } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

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
  const cartContext = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!cartContext || !cartContext.addToCart) {
      console.error('Cart context not available');
      toast({
        title: "Error",
        description: "Shopping cart is not available",
        variant: "destructive"
      });
      return;
    }
    
    try {
      cartContext.addToCart(product);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive"
      });
    }
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
      <Card className="group overflow-hidden hover:shadow-md transition-all duration-300 border-0 shadow-sm hover:shadow-primary/10 h-full bg-card dark:bg-card">
        {/* Product Image */}
        <div className="relative overflow-hidden">
          <img 
            src={getProductImageSrc(product.image)} 
            alt={product.name} 
            className="w-full h-40 sm:h-48 md:h-52 lg:h-56 xl:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&auto=format`;
            }}
          />
          
          {/* Overlay on hover - Desktop only */}
          <div className="hidden md:flex absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 items-center justify-center">
            <Button 
              variant="secondary" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 transition-opacity font-poppins bg-background/90 hover:bg-background text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              Quick View
            </Button>
          </div>

          {/* Top badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.categories && (
              <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm font-poppins text-xs md:text-sm px-2 py-1">
                {product.categories.name}
              </Badge>
            )}
            {product.verification_status === 'approved' && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 shadow-sm text-xs md:text-sm px-2 py-1">
                <Verified className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                Verified
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          {showFavorite && (
            <button
              onClick={handleToggleFavorite}
              className="absolute top-2 right-2 bg-background/90 rounded-full p-2 md:p-2.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4 sm:p-5 lg:p-6 space-y-3 flex-1 flex flex-col">
          {/* Product Name */}
          <h3 className="font-semibold text-base md:text-lg lg:text-xl text-foreground group-hover:text-primary transition-colors font-poppins line-clamp-2 flex-shrink-0">
            {product.name}
          </h3>
          
          {/* Price with Tier Indicator */}
          <div className="space-y-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xl md:text-2xl lg:text-3xl font-bold text-primary font-poppins">
                PKR {product.price.toLocaleString()}
              </span>
              {product.moq && product.moq > 1 && (
                <Badge variant="outline" className="text-xs md:text-sm text-muted-foreground border-border px-2 py-1">
                  MOQ: {product.moq}
                </Badge>
              )}
            </div>
            {/* Bulk pricing indicator */}
            <div className="flex items-center gap-1">
              <Badge className="text-xs md:text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-2 py-1">
                Bulk discounts available
              </Badge>
            </div>
          </div>

          {/* Supplier Info */}
          {product.shops && (
            <div className="flex items-center justify-between">
              <p className="text-sm md:text-base font-medium text-foreground font-poppins truncate">
                {product.shops.name}
              </p>
              {product.shops?.cities && (
                <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  <span className="font-poppins truncate">{product.shops.cities.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Description - Show on tablets and up */}
          {product.description && (
            <p className="hidden md:block text-sm lg:text-base text-muted-foreground font-poppins line-clamp-3 flex-shrink-0">
              {product.description}
            </p>
          )}

          {/* Order Button */}
          {showAddToCart && (
            <div className="mt-auto pt-3 flex-shrink-0">
              <Link to={`/product/${product.id}`} className="block">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-poppins text-sm md:text-base h-10 md:h-12"
                  size="default"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  View Product
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;
