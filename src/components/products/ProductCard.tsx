
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  moq: number;
  shop_id: string;
  description?: string;
  brand?: string;
  verification_status: string;
  shops?: {
    id: string;
    name: string;
    owner_id: string;
  };
}

interface ProductCardProps {
  product: Product;
  currentUserId?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, currentUserId }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!currentUserId) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to cart.",
        variant: "destructive"
      });
      return;
    }

    if (product.shops?.owner_id === currentUserId) {
      toast({
        title: "Cannot add own product",
        description: "You cannot add your own products to cart.",
        variant: "destructive"
      });
      return;
    }

    if (!product.shops) {
      toast({
        title: "Shop information missing",
        description: "Unable to add product to cart.",
        variant: "destructive"
      });
      return;
    }

    addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      shopId: product.shop_id,
      shopName: product.shops.name,
      price: product.price,
      quantity: product.moq,
      moq: product.moq
    });
  };

  const handleViewProduct = () => {
    navigate(`/products/${product.id}`);
  };

  const isOwnProduct = product.shops?.owner_id === currentUserId;

  return (
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewProduct}>
      <CardContent className="p-4">
        <div className="aspect-square relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          
          {product.verification_status === 'approved' && (
            <Badge variant="default" className="absolute top-2 right-2 bg-green-600">
              Verified
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
          
          {product.brand && (
            <p className="text-sm text-gray-600">Brand: {product.brand}</p>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-pakistani_green-700">
              Rs. {product.price.toLocaleString()}
            </span>
            <span className="text-sm text-gray-600">
              MOQ: {product.moq}
            </span>
          </div>

          {product.shops && (
            <p className="text-sm text-gray-600">
              Shop: {product.shops.name}
            </p>
          )}

          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation();
            handleViewProduct();
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>

        {!isOwnProduct && (
          <Button
            size="sm"
            className="flex-1 bg-pakistani_green-700 hover:bg-pakistani_green-800"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
