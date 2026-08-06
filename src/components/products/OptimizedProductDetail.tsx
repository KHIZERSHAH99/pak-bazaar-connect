import React, { useState, lazy, Suspense, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Package, 
  MapPin, 
  Star, 
  CheckCircle, 
  AlertCircle,
  Truck,
  Shield,
  MessageSquare,
  Award,
  Clock,
  Box,
  Palette
} from 'lucide-react';
import { Product } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import FavoriteButton from '@/components/favorites/FavoriteButton';
import { useNavigate } from 'react-router-dom';
import { usePricingTiers } from '@/hooks/usePricingTiers';
import MessageButton from '@/components/messaging/MessageButton';
import InquiryButton from '@/components/inquiry/InquiryButton';
import { ShareButtons } from './ShareButtons';
import ProductImageGallery from './ProductImageGallery';
import ProductReviews from './ProductReviews';
import RelatedProducts from './RelatedProducts';

// Lazy load non-critical components for better initial load
const EnhancedOrderForm = lazy(() => import('@/components/orders/EnhancedOrderForm'));
const TieredPricingDisplay = lazy(() => import('./TieredPricingDisplay'));
const PriceCalculator = lazy(() => import('./PriceCalculator'));
const EnhancedVariationPicker = lazy(() => import('./variations/EnhancedVariationPicker'));

interface OptimizedProductDetailProps {
  product: Product;
  onBack: () => void;
}

// Memoized product header to prevent unnecessary re-renders
const ProductHeader = memo(({ product, onBack }: { product: Product; onBack: () => void }) => (
  <div className="flex items-center justify-between mb-6">
    <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
      <ArrowLeft className="h-4 w-4" />
      Back to Products
    </Button>
    <div className="flex items-center gap-2">
      <ShareButtons 
        productName={product.name}
        productUrl={window.location.href}
        productImage={product.product_images?.[0]?.image_url || product.image}
      />
      <FavoriteButton productId={product.id} />
    </div>
  </div>
));

ProductHeader.displayName = 'ProductHeader';

// Stock status badge
const StockBadge = ({ quantity }: { quantity?: number }) => {
  if (!quantity) return null;
  
  if (quantity === 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  } else if (quantity < 10) {
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock: {quantity} units</Badge>;
  }
  return <Badge variant="default" className="bg-green-100 text-green-800">In Stock: {quantity} units</Badge>;
};

// Product features grid
const ProductFeatures = memo(({ product }: { product: Product }) => {
  const features = [];
  
  if (product.brand) features.push({ icon: Award, label: 'Brand', value: product.brand });
  if (product.lead_time_days) features.push({ icon: Clock, label: 'Lead Time', value: `${product.lead_time_days} days` });
  if (product.package_weight) features.push({ icon: Box, label: 'Weight', value: `${product.package_weight} kg` });
  if (product.customization_available) features.push({ icon: Palette, label: 'Customization', value: 'Available' });
  if (product.warranty_info) features.push({ icon: Shield, label: 'Warranty', value: product.warranty_info });
  
  if (features.length === 0) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Features</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
              <feature.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium">{feature.label}</p>
                <p className="text-sm text-muted-foreground truncate">{feature.value}</p>
              </div>
            </div>
          ))}
          {product.certifications && product.certifications.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
              <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Certifications</p>
                <p className="text-sm text-muted-foreground truncate">{product.certifications.join(', ')}</p>
              </div>
            </div>
          )}
          {product.colors_available && product.colors_available.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
              <Palette className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Colors</p>
                <p className="text-sm text-muted-foreground truncate">{product.colors_available.join(', ')}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ProductFeatures.displayName = 'ProductFeatures';

// Product specifications table
const ProductSpecifications = memo(({ product }: { product: Product }) => {
  const specs = [
    ...(product.product_specifications || []).map(spec => ({
      label: spec.spec_name,
      value: spec.spec_value
    })),
    ...(product.brand ? [{ label: 'Brand', value: product.brand }] : []),
    ...(product.model_number ? [{ label: 'Model Number', value: product.model_number }] : []),
    ...(product.origin_country ? [{ label: 'Origin', value: product.origin_country }] : []),
    ...(product.package_dimensions ? [{ label: 'Dimensions', value: product.package_dimensions }] : []),
    ...(product.package_weight ? [{ label: 'Weight', value: `${product.package_weight} kg` }] : []),
    ...(product.units_per_package ? [{ label: 'Units per Package', value: product.units_per_package.toString() }] : []),
    ...(product.packaging_type ? [{ label: 'Packaging', value: product.packaging_type }] : [])
  ];
  
  if (specs.length === 0) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <tbody>
            {specs.map((spec, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                <td className="px-4 py-2 font-medium text-muted-foreground">{spec.label}</td>
                <td className="px-4 py-2">{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
});

ProductSpecifications.displayName = 'ProductSpecifications';

// Memoized product info to prevent unnecessary re-renders
const ProductInfo = memo(({ product }: { product: Product }) => {
  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Prepare images array for gallery
  const images = product.product_images && product.product_images.length > 0
    ? product.product_images
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map(img => img.image_url)
    : product.image ? [product.image] : [];

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Product Image Gallery */}
      {images.length > 0 ? (
        <ProductImageGallery images={images} alt={product.name} />
      ) : (
        <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          <Package className="h-24 w-24 text-muted-foreground" />
        </div>
      )}

      {/* Product Info */}
      <div className="space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
            <div className="flex gap-2">
              {getVerificationBadge(product.verification_status)}
              <StockBadge quantity={product.stock_quantity} />
            </div>
          </div>
          
          {product.shops && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{product.shops.name}</span>
            </div>
          )}
          
          {product.avg_rating && product.total_reviews ? (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="ml-1 text-sm font-medium">{product.avg_rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">({product.total_reviews} reviews)</span>
            </div>
          ) : null}
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground text-sm md:text-base">
            {product.description || 'No description available'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <div>
            <Label className="text-sm text-muted-foreground">Base Price</Label>
            <p className="text-xl md:text-2xl font-bold">Rs. {product.price.toLocaleString()}</p>
          </div>
          
          {product.moq && (
            <div>
              <Label className="text-sm text-muted-foreground">MOQ</Label>
              <p className="text-base md:text-lg font-semibold">{product.moq} units</p>
            </div>
          )}
        </div>

        {product.sample_available && (
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
            <CheckCircle className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-sm md:text-base">Sample Available</p>
              {product.sample_price && (
                <p className="text-sm text-muted-foreground">Rs. {product.sample_price}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ProductInfo.displayName = 'ProductInfo';

const OptimizedProductDetail: React.FC<OptimizedProductDetailProps> = ({ product, onBack }) => {
  // Defensive null check
  if (!product || !product.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Package className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">The product data is invalid or missing.</p>
          <Button onClick={onBack}>Back to Products</Button>
        </div>
      </div>
    );
  }

  const [quantity, setQuantity] = useState(product.moq || 1);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<any>({});
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  
  // Single pricing calculation hook
  const { tiers, loading: tiersLoading, calculatePrice } = usePricingTiers(product.id);
  
  // Calculate current pricing - calculatePrice returns the unit price for the given quantity
  const unitPrice = calculatePrice(quantity, product.price);
  const totalPrice = unitPrice * quantity;

  const handleQuantityChange = (value: string) => {
    const newQuantity = parseInt(value) || 1;
    const minQuantity = product.moq || 1;
    const maxQuantity = product.stock_quantity;
    
    if (newQuantity < minQuantity) {
      setQuantity(minQuantity);
      toast({
        title: "Minimum Order Quantity",
        description: `The minimum order quantity is ${minQuantity} units`,
      });
    } else if (maxQuantity && newQuantity > maxQuantity) {
      setQuantity(maxQuantity);
      toast({
        title: "Stock Limit Exceeded",
        description: `Only ${maxQuantity} units available in stock`,
        variant: "destructive"
      });
    } else {
      setQuantity(newQuantity);
    }
  };

  const handleOrderClick = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to place orders",
        variant: "destructive"
      });
      return;
    }

    if (profile?.role !== 'seller') {
      toast({
        title: "Seller Account Required",
        description: "Only sellers can place orders.",
        variant: "destructive"
      });
      return;
    }

    if (product.shops?.owner_id === user.id) {
      toast({
        title: "Cannot Order",
        description: "You cannot order from your own shop",
        variant: "destructive"
      });
      return;
    }

    setShowOrderForm(true);
  };

  const handleOrderCreated = (orderId: string) => {
    setShowOrderForm(false);
    toast({
      title: "Order Created",
      description: "Your order has been submitted successfully",
    });
    navigate('/dashboard/orders');
  };

  if (showOrderForm) {
    return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Skeleton className="h-96 w-full max-w-2xl" /></div>}>
        <EnhancedOrderForm
          shopId={product.shop_id}
          shopName={product.shops?.name || 'Unknown Shop'}
          totalAmount={totalPrice}
          productId={product.id}
          onOrderCreated={handleOrderCreated}
          onCancel={() => setShowOrderForm(false)}
        />
      </Suspense>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        <ProductHeader product={product} onBack={onBack} />
        <ProductInfo product={product} />

        <Separator />

        {/* Product Features */}
        <ProductFeatures product={product} />

        {/* Product Specifications */}
        <ProductSpecifications product={product} />

        {/* Pricing Section - Combined and lazy loaded */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tiered Pricing Display */}
            {!tiersLoading && tiers.length > 0 && (
              <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <TieredPricingDisplay
                  tiers={tiers}
                  currentQuantity={quantity}
                  basePrice={product.price}
                />
              </Suspense>
            )}

            {/* Quantity Input - Mobile optimized */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="quantity" className="text-sm md:text-base">
                  Quantity (Min: {product.moq || 1}{product.stock_quantity ? `, Max: ${product.stock_quantity}` : ''})
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min={product.moq || 1}
                  max={product.stock_quantity || undefined}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="h-12 md:h-10 text-base"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm md:text-base">
                <span>Quantity:</span>
                <span className="font-semibold">{quantity} units</span>
              </div>
              <div className="flex justify-between text-sm md:text-base">
                <span>Unit Price:</span>
                <span className="font-semibold">Rs. {unitPrice.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base md:text-lg">
                <span className="font-bold">Total Amount:</span>
                <span className="font-bold text-primary">Rs. {totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons - Mobile optimized */}
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleOrderClick}
                className="w-full h-12 md:h-10"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Place Order
              </Button>
              
              {product.shops?.owner_id && user && (
                <div className="grid grid-cols-2 gap-3">
                  <MessageButton 
                    sellerId={product.shops.owner_id}
                    sellerName={product.shops.name}
                  />
                  <InquiryButton 
                    sellerId={product.shops.owner_id}
                    productId={product.id}
                  />
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 pt-4">
              <div className="flex flex-col items-center gap-1 text-center">
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span className="text-[10px] md:text-xs text-muted-foreground">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <Truck className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span className="text-[10px] md:text-xs text-muted-foreground">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <Star className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span className="text-[10px] md:text-xs text-muted-foreground">Quality Assured</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <ProductReviews 
            productId={product.id}
            avgRating={product.avg_rating}
            totalReviews={product.total_reviews}
          />
        </Suspense>

        {/* Related Products */}
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <RelatedProducts 
            productId={product.id} 
            categoryId={product.category_id} 
            shopId={product.shop_id}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default memo(OptimizedProductDetail);
