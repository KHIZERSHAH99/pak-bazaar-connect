import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, MessageCircle, Star, MapPin, Package, Heart, Share2, Eye, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/lib/types';
import ProductImageGallery from './ProductImageGallery';
import VerifiedBadge from '@/components/reviews/VerifiedBadge';
import ProductOrderButton from './ProductOrderButton';
import InquiryButton from '@/components/inquiry/InquiryButton';
import { addToFavorites, removeFromFavorites, getFavoriteProducts } from '@/lib/favorites';
import { cn } from '@/lib/utils';

interface EnhancedProductDetailProps {
  product: Product;
  onBack: () => void;
}

const EnhancedProductDetail: React.FC<EnhancedProductDetailProps> = ({ product, onBack }) => {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(product.moq || 1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Prepare images array
  const productImages = product.product_images || [];
  const allImages = product.image 
    ? [product.image, ...productImages.map(img => img.image_url)]
    : productImages.map(img => img.image_url);

  // Get pricing tiers
  const pricingTiers = product.product_pricing_tiers || [];
  const specifications = product.product_specifications || [];

  // Calculate display price based on quantity
  let displayPrice = product.price;
  if (pricingTiers.length > 0) {
    const tier = pricingTiers.find(t => 
      quantity >= t.min_quantity && 
      (!t.max_quantity || quantity <= t.max_quantity)
    );
    if (tier) displayPrice = tier.unit_price;
  }

  const handleInquiry = () => {
    toast({
      title: "Inquiry Sent",
      description: "Your inquiry has been sent to the wholesaler. They will contact you soon.",
    });
  };

  const handleAddToCart = () => {
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  useEffect(() => {
    checkIfFavorite();
  }, [product.id]);

  const checkIfFavorite = async () => {
    try {
      const favorites = await getFavoriteProducts();
      setIsFavorite(favorites.some(fav => fav.product_id === product.id));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFromFavorites(product.id);
        setIsFavorite(false);
        toast({
          title: "Removed from Favorites",
          description: `${product.name} has been removed from your favorites.`,
        });
      } else {
        await addToFavorites(product.id);
        setIsFavorite(true);
        toast({
          title: "Added to Favorites",
          description: `${product.name} has been added to your favorites.`,
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Product link has been copied to clipboard.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Actions */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" onClick={onBack} className="font-poppins">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={toggleFavorite}>
              <Heart className={cn("h-4 w-4", isFavorite && "fill-red-500 text-red-500")} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <ProductImageGallery images={allImages.length > 0 ? allImages : ['/placeholder.svg']} alt={product.name} />
            
            {/* Remove fake stats */}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="font-poppins">
                  {product.categories?.name || 'General'}
                </Badge>
                <VerifiedBadge isVerified={product.verification_status === 'approved'} size="sm" />
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-4 font-poppins">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <span className="font-poppins">{product.shops?.address || 'Pakistan'}</span>
              </div>
            </div>

            {/* Pricing */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-primary">
                    Rs. {displayPrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">per unit</span>
                </div>
                
                <div className="text-sm text-muted-foreground mb-4">
                  MOQ: {product.moq || 1} units
                </div>

                {product.sample_available && product.sample_price && (
                  <div className="text-sm bg-secondary/50 px-3 py-2 rounded-md">
                    Sample available: Rs. {product.sample_price.toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing Tiers */}
            {pricingTiers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-poppins">Bulk Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pricingTiers.map((tier, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <span className="text-sm">
                          {tier.max_quantity ? `${tier.min_quantity} - ${tier.max_quantity}` : `${tier.min_quantity}+`} units
                        </span>
                        <span className="font-semibold text-primary">
                          Rs. {tier.unit_price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quantity Selector */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-medium font-poppins">Quantity:</label>
                  <input
                    type="number"
                    min={product.moq || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(product.moq || 1, Number(e.target.value)))}
                    className="w-24 px-3 py-2 border rounded-md text-center"
                  />
                  <span className="text-sm text-muted-foreground">
                    Total: Rs. {(displayPrice * quantity).toLocaleString()}
                  </span>
                </div>

                <div className="flex gap-3">
                  <ProductOrderButton
                    product={product}
                    quantity={quantity}
                    className="flex-1"
                  />
                  <InquiryButton 
                    sellerId={product.shops?.owner_id || ''}
                    productId={product.id}
                    className="flex-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description" className="font-poppins">Description</TabsTrigger>
              <TabsTrigger value="specifications" className="font-poppins">Specifications</TabsTrigger>
              <TabsTrigger value="supplier" className="font-poppins">Supplier Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground leading-relaxed font-poppins">
                    {product.description || 'No description available.'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {specifications.length > 0 ? (
                    <div className="grid gap-4">
                      {specifications.map((spec, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <span className="font-medium font-poppins">{spec.spec_name}</span>
                          <span className="text-muted-foreground font-poppins">{spec.spec_value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground font-poppins">No specifications available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="supplier" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 font-poppins">Shop Information</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium font-poppins">Shop Name:</span>
                          <p className="text-muted-foreground font-poppins">{product.shops?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium font-poppins">Address:</span>
                          <p className="text-muted-foreground font-poppins">{product.shops?.address || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium font-poppins">Postal Code:</span>
                          <p className="text-muted-foreground font-poppins">{product.shops?.postal_code || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4 font-poppins">Contact Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary" />
                          <span className="font-poppins">{product.shops?.contact || 'N/A'}</span>
                        </div>
                        <div className="text-sm text-muted-foreground font-poppins">
                          New Seller
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductDetail;