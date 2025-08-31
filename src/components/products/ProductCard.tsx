
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
      <Card className="group overflow-hidden hover:shadow-md transition-all duration-300 border-0 shadow-sm hover:shadow-primary/10 h-full bg-card dark:bg-card">
        {/* Product Image */}
        <div className="relative overflow-hidden">
          <img 
            src={getProductImageSrc(product.image)} 
            alt={product.name} 
            className="w-full h-32 sm:h-36 lg:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
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
              <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm font-poppins text-[10px] px-1.5 py-0.5 h-auto">
                {product.categories.name}
              </Badge>
            )}
            {product.verification_status === 'approved' && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 shadow-sm text-[10px] px-1.5 py-0.5 h-auto">
                <Verified className="w-2.5 h-2.5 mr-0.5" />
                Verified
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          {showFavorite && (
            <button
              onClick={handleToggleFavorite}
              className="absolute top-2 right-2 bg-background/90 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <Heart className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Product Details */}
        <div className="p-3 space-y-2 flex-1 flex flex-col">
          {/* Product Name */}
          <h3 className="font-semibold text-sm lg:text-base text-foreground group-hover:text-primary transition-colors font-poppins line-clamp-1 flex-shrink-0">
            {product.name}
          </h3>
          
          {/* Price */}
          <div className="flex items-center justify-between flex-shrink-0">
            <span className="text-lg lg:text-xl font-bold text-primary font-poppins">
              PKR {product.price.toLocaleString()}
            </span>
            {product.moq && product.moq > 1 && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-border px-1.5 py-0.5 h-auto">
                MOQ: {product.moq}
              </Badge>
            )}
          </div>

          {/* Supplier Info */}
          {product.shops && (
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground font-poppins truncate">
                {product.shops.name}
              </p>
              {product.shops?.cities && (
                <div className="flex items-center text-[10px] text-muted-foreground">
                  <MapPin className="w-2.5 h-2.5 mr-0.5" />
                  <span className="font-poppins truncate">{product.shops.cities.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Description - Hide on mobile */}
          {product.description && (
            <p className="hidden sm:block text-xs text-muted-foreground font-poppins line-clamp-2 flex-shrink-0">
              {product.description}
            </p>
          )}

          {/* Order Button */}
          {showAddToCart && (
            <div className="mt-auto pt-2 flex-shrink-0">
              <Link to={`/product/${product.id}`} className="block">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-poppins text-xs h-8"
                  size="sm"
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
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
