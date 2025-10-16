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
  MessageSquare
} from 'lucide-react';
import { Product } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import FavoriteButton from '@/components/favorites/FavoriteButton';
import { useNavigate } from 'react-router-dom';
import { usePricingTiers } from '@/hooks/usePricingTiers';
import MessageButton from '@/components/messaging/MessageButton';

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
    <FavoriteButton productId={product.id} />
  </div>
));

ProductHeader.displayName = 'ProductHeader';

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

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Product Image */}
      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-24 w-24 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            {getVerificationBadge(product.verification_status)}
          </div>
          
          {product.shops && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{product.shops.name}</span>
            </div>
          )}
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground">
            {product.description || 'No description available'}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <Label className="text-sm text-muted-foreground">Base Price</Label>
            <p className="text-2xl font-bold">Rs. {product.price.toLocaleString()}</p>
          </div>
          
          {product.moq && (
            <div>
              <Label className="text-sm text-muted-foreground">MOQ</Label>
              <p className="text-lg font-semibold">{product.moq} units</p>
            </div>
          )}
        </div>

        {product.sample_available && (
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
            <CheckCircle className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Sample Available</p>
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
  const [quantity, setQuantity] = useState(product.moq || 1);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<any>({});
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  
  // Single pricing calculation hook
  const { tiers, loading: tiersLoading, calculatePrice } = usePricingTiers(product.id);
  
  // Calculate current pricing
  const priceResult = calculatePrice(quantity);
  const unitPrice = typeof priceResult === 'number' ? priceResult / quantity : product.price;
  const totalPrice = typeof priceResult === 'number' ? priceResult : product.price * quantity;

  const handleQuantityChange = (value: string) => {
    const newQuantity = parseInt(value) || 1;
    const minQuantity = product.moq || 1;
    
    if (newQuantity < minQuantity) {
      setQuantity(minQuantity);
      toast({
        title: "Minimum Order Quantity",
        description: `The minimum order quantity is ${minQuantity} units`,
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <ProductHeader product={product} onBack={onBack} />
        <ProductInfo product={product} />

        <Separator />

        {/* Variations - removed for simplification */}

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

            {/* Price Calculator */}
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quantity">Quantity (Min: {product.moq || 1})</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={product.moq || 1}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                  />
                </div>
              </div>
            </Suspense>

            {/* Order Summary */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span className="font-semibold">{quantity} units</span>
              </div>
              <div className="flex justify-between">
                <span>Unit Price:</span>
                <span className="font-semibold">Rs. {unitPrice.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total Amount:</span>
                <span className="font-bold text-primary">Rs. {totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={handleOrderClick}
                className="flex-1"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Place Order
              </Button>
              
              {product.shops?.owner_id && user && (
                <MessageButton 
                  sellerId={product.shops.owner_id}
                  sellerName={product.shops.name}
                />
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center gap-1 text-center">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <Star className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground">Quality Assured</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default memo(OptimizedProductDetail);
