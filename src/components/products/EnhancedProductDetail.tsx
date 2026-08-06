
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import EnhancedOrderForm from '@/components/orders/EnhancedOrderForm';
import { useNavigate } from 'react-router-dom';
import TieredPricingDisplay from './TieredPricingDisplay';
import PriceCalculator from './PriceCalculator';
import { usePricingTiers } from '@/hooks/usePricingTiers';
import EnhancedVariationPicker from './variations/EnhancedVariationPicker';
import MessageButton from '@/components/messaging/MessageButton';

interface EnhancedProductDetailProps {
  product: Product;
  onBack: () => void;
}

const EnhancedProductDetail: React.FC<EnhancedProductDetailProps> = ({ product, onBack }) => {
  const [quantity, setQuantity] = useState(product.moq || 1);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [currentUnitPrice, setCurrentUnitPrice] = useState(product.price > 0 ? product.price : 100);
  const [totalAmount, setTotalAmount] = useState((product.price > 0 ? product.price : 100) * (product.moq || 1));
  const [selectedVariations, setSelectedVariations] = useState<any>({});
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { tiers, loading: tiersLoading, calculatePrice } = usePricingTiers(product.id);

  const handleQuantityChange = (value: string) => {
    const newQuantity = parseInt(value) || 1;
    const minQuantity = product.moq || 1;
    
    if (newQuantity < minQuantity) {
      setQuantity(minQuantity);
      toast({
        title: "Minimum Order Quantity",
        description: `The minimum order quantity for this product is ${minQuantity}`,
        variant: "default"
      });
    } else {
      setQuantity(newQuantity);
    }
  };

  const handleOrderClick = () => {
    // Only authenticated sellers can place orders
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
        description: "Only sellers can place orders. Please switch to seller role.",
        variant: "destructive"
      });
      return;
    }

    // Check if trying to order from own shop
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
      variant: "default"
    });
    navigate('/dashboard/orders');
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

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

  if (showOrderForm) {
    return (
      <EnhancedOrderForm
        shopId={product.shop_id}
        shopName={product.shops?.name || 'Unknown Shop'}
        totalAmount={totalAmount}
        productId={product.id}
        onOrderCreated={handleOrderCreated}
        onCancel={() => setShowOrderForm(false)}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
          <div className="flex items-center gap-2">
            {getVerificationIcon(product.verification_status)}
            {getVerificationBadge(product.verification_status)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold font-poppins mb-2">{product.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{product.shops?.name || 'Unknown Shop'}</span>
                </div>
              </div>
              <FavoriteButton
                productId={product.id}
              />
            </div>

            {/* Pricing Information */}
            <div className="space-y-6">
              {/* Base Price Display */}
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    PKR {product.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">per unit (base price)</span>
                </div>

                {product.moq && product.moq > 1 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4" />
                    <span>Minimum Order: {product.moq} units</span>
                  </div>
                )}

                {product.stock_quantity && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{product.stock_quantity} units in stock</span>
                  </div>
                )}
              </div>

            {/* Product Variations */}
            <EnhancedVariationPicker
              productId={product.id}
              basePrice={product.price}
              onVariationChange={(variations, totalPrice) => {
                setSelectedVariations(variations);
                // Ensure price is never 0
                const validPrice = totalPrice > 0 ? totalPrice : (product.price > 0 ? product.price : 100);
                setCurrentUnitPrice(validPrice);
                setTotalAmount(validPrice * quantity);
              }}
            />

            {/* Tiered Pricing Display */}
            {!tiersLoading && (
              <TieredPricingDisplay
                tiers={tiers}
                currentQuantity={quantity}
                basePrice={currentUnitPrice}
              />
            )}
            </div>

            <Separator />

            {/* Price Calculator and Order Section */}
            <div className="space-y-4">
              <PriceCalculator
                tiers={tiers}
                basePrice={currentUnitPrice || product.price}
                moq={product.moq}
                stockQuantity={product.stock_quantity}
                onQuantityChange={(qty, unitPrice, total) => {
                  setQuantity(qty);
                  
                  // Only update unit price if no variations are selected
                  if (!selectedVariations || Object.keys(selectedVariations).length === 0) {
                    setCurrentUnitPrice(unitPrice);
                    setTotalAmount(total);
                  } else {
                    // With variations, use current unit price with new quantity
                    setTotalAmount(currentUnitPrice * qty);
                  }
                }}
              />

              <div className="space-y-3">
                <Button 
                  onClick={handleOrderClick}
                  className="w-full"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Place Order - PKR {totalAmount.toLocaleString()}
                </Button>

                {/* Add Message Button for retailers to contact wholesalers */}
                {product.shops?.owner_id && user && profile?.role === 'seller' && product.shops.owner_id !== user.id && (
                  <MessageButton 
                    sellerId={product.shops.owner_id}
                    sellerName={product.shops.name || "Wholesaler"}
                    productId={product.id}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Product Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.brand && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brand:</span>
                  <span className="font-medium">{product.brand}</span>
                </div>
              )}
              {product.model_number && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model:</span>
                  <span className="font-medium">{product.model_number}</span>
                </div>
              )}
              {product.origin_country && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Origin:</span>
                  <span className="font-medium">{product.origin_country}</span>
                </div>
              )}
              {product.package_weight && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight:</span>
                  <span className="font-medium">{product.package_weight} kg</span>
                </div>
              )}
              {product.units_per_package && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Units per package:</span>
                  <span className="font-medium">{product.units_per_package}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Features */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.sample_available && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Sample Available</span>
                  {product.sample_price && (
                    <span className="text-sm text-muted-foreground">
                      (PKR {product.sample_price})
                    </span>
                  )}
                </div>
              )}
              {product.customization_available && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Customization Available</span>
                </div>
              )}
              {product.warranty_info && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>Warranty: {product.warranty_info}</span>
                </div>
              )}
              {product.certifications && product.certifications.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Certifications:</p>
                  <div className="flex flex-wrap gap-1">
                    {product.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductDetail;
