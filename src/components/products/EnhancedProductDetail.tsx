
import React, { useState } from 'react';
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
  Shield
} from 'lucide-react';
import { Product } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContextFixed';
import { useToast } from '@/hooks/use-toast';
import FavoriteButton from '@/components/favorites/FavoriteButton';
import EnhancedOrderForm from '@/components/orders/EnhancedOrderForm';
import { useNavigate } from 'react-router-dom';

interface EnhancedProductDetailProps {
  product: Product;
  onBack: () => void;
}

const EnhancedProductDetail: React.FC<EnhancedProductDetailProps> = ({ product, onBack }) => {
  const [quantity, setQuantity] = useState(product.moq || 1);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const totalAmount = quantity * product.price;

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
    if (!profile) {
      toast({
        title: "Login Required",
        description: "Please login to place an order",
        variant: "destructive"
      });
      return;
    }

    if (profile.role !== 'seller') {
      toast({
        title: "Access Denied",
        description: "Only sellers can place orders",
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

            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  PKR {product.price.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">per unit</span>
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

              {product.lead_time_days && (
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4" />
                  <span>Lead time: {product.lead_time_days} days</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Order Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={product.moq || 1}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">
                    PKR {totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleOrderClick}
                className="w-full"
                size="lg"
                disabled={!profile || profile.role !== 'seller'}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Place Order
              </Button>

              {(!profile || profile.role !== 'seller') && (
                <p className="text-sm text-muted-foreground text-center">
                  Please login as a seller to place orders
                </p>
              )}
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
