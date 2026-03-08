
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Eye, Trash2, Share2 } from 'lucide-react';
import { DemoProduct } from '@/data/demoProducts';
import { useToast } from '@/hooks/use-toast';

interface WishlistManagerProps {
  wishlistItems: DemoProduct[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: DemoProduct) => void;
  onShare: (product: DemoProduct) => void;
}

const WishlistManager: React.FC<WishlistManagerProps> = ({
  wishlistItems,
  onRemoveFromWishlist,
  onAddToCart,
  onShare
}) => {
  const { toast } = useToast();

  const handleRemove = (product: DemoProduct) => {
    onRemoveFromWishlist(product.id);
    toast({
      title: "Removed from Wishlist",
      description: `${product.name} has been removed from your wishlist.`,
    });
  };

  const handleAddToCart = (product: DemoProduct) => {
    if (!product.inStock) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive"
      });
      return;
    }
    onAddToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleShare = (product: DemoProduct) => {
    onShare(product);
    toast({
      title: "Link Copied",
      description: "Product link has been copied to clipboard.",
    });
  };

  if (wishlistItems.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2 font-poppins">Your wishlist is empty</h3>
        <p className="text-gray-600 font-poppins">Save products you love for later by clicking the heart icon.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-poppins">My Wishlist</h2>
          <p className="text-gray-600 font-poppins">{wishlistItems.length} items saved</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300">
            <div className="relative">
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                onClick={() => handleRemove(product)}
              >
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              </Button>
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive" className="font-poppins">Out of Stock</Badge>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs font-poppins">
                  {product.category}
                </Badge>
                <h3 className="font-semibold text-lg font-poppins line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground font-poppins line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary font-poppins">
                    PKR {product.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 font-poppins">
                    MOQ: {product.minOrder}
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-poppins">
                  by {product.wholesaler}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inStock}
                  className="flex-1 bg-pakistani_green-600 hover:bg-pakistani_green-700"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3"
                  onClick={() => handleShare(product)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WishlistManager;
