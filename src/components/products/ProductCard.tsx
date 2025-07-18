
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Package, MapPin, Eye, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!product.shops?.owner_id) {
      toast({
        title: "Error",
        description: "Shop information not available",
        variant: "destructive"
      });
      return;
    }

    addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.image || '',
      shopId: product.shop_id,
      shopName: product.shops?.name || 'Unknown Shop',
      price: product.price,
      moq: product.moq || 1,
      quantity: product.moq || 1
    });

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleViewProduct = () => {
    navigate(`/products/${product.id}`);
  };

  const getImageSrc = () => {
    if (product.image && !product.image.includes('placeholder.svg')) {
      return product.image;
    }
    return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 bg-white">
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={getImageSrc()}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onClick={handleViewProduct}
        />
        
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleViewProduct}
            className="bg-white/90 text-gray-800 hover:bg-white"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 text-gray-800 hover:bg-white"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.verification_status === 'approved' && (
            <Badge className="bg-green-100 text-green-800 text-xs">
              Verified
            </Badge>
          )}
          {product.moq && product.moq > 1 && (
            <Badge variant="outline" className="bg-white/90 text-xs">
              MOQ: {product.moq}
            </Badge>
          )}
        </div>

        {/* Price tag */}
        <div className="absolute top-2 right-2">
          <Badge className="bg-pakistani_green-600 text-white font-semibold">
            {formatPrice(product.price)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div onClick={handleViewProduct}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-pakistani_green-600 transition-colors font-poppins">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-1 font-poppins">
              {product.description}
            </p>
          )}
        </div>

        {/* Shop info */}
        {product.shops && (
          <div className="flex items-center text-sm text-gray-500 space-x-1">
            <Package className="h-3 w-3" />
            <span className="font-poppins">{product.shops.name}</span>
            {product.shops.cities && (
              <>
                <MapPin className="h-3 w-3 ml-2" />
                <span className="font-poppins">{product.shops.cities.name}</span>
              </>
            )}
          </div>
        )}

        {/* Rating and reviews */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium font-poppins">
              {product.avg_rating || 'New'}
            </span>
            {product.total_reviews && (
              <span className="text-sm text-gray-500 font-poppins">
                ({product.total_reviews})
              </span>
            )}
          </div>
          
          <div className="text-xs text-gray-500 font-poppins">
            {product.categories?.name}
          </div>
        </div>

        {/* Action button */}
        <div className="pt-2">
          <Button
            onClick={handleAddToCart}
            className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white font-poppins"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
