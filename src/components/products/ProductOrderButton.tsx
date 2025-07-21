import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContextFixed';
import { useToast } from '@/hooks/use-toast';
import EnhancedOrderForm from '@/components/orders/EnhancedOrderForm';

interface ProductOrderButtonProps {
  product: Product;
}

const ProductOrderButton: React.FC<ProductOrderButtonProps> = ({ product }) => {
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(product.moq || 1);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const totalAmount = (product.price || 0) * quantity;
  const canOrder = user && profile?.role === 'seller';

  const handleOrderClick = () => {
    if (!canOrder) {
      toast({
        title: 'Access Required',
        description: 'Please sign in as a seller to place orders',
        variant: 'destructive'
      });
      return;
    }

    // Check if trying to order from own shop
    if (product.shops?.owner_id === user?.id) {
      toast({
        title: 'Cannot Order',
        description: 'You cannot order from your own shop',
        variant: 'destructive'
      });
      return;
    }

    setIsOrderDialogOpen(true);
  };

  const handleQuantityChange = (newQuantity: number) => {
    const minQty = product.moq || 1;
    if (newQuantity >= minQty) {
      setQuantity(newQuantity);
    }
  };

  const handleOrderCreated = (orderId: string) => {
    setIsOrderDialogOpen(false);
    toast({
      title: 'Order Placed',
      description: 'Your order has been submitted successfully',
    });
  };

  return (
    <>
      <div className="space-y-3">
        {/* Quantity Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Quantity</Label>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= (product.moq || 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="w-20 text-center"
              min={product.moq || 1}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {product.moq && product.moq > 1 && (
            <p className="text-xs text-gray-600">
              Minimum order: {product.moq} units
            </p>
          )}
        </div>

        {/* Total Amount */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Amount:</span>
            <span className="text-lg font-bold text-primary">
              Rs. {totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Order Button */}
        <Button
          onClick={handleOrderClick}
          disabled={!canOrder}
          className="w-full bg-primary hover:bg-primary/90"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {canOrder ? 'Place Order' : 'Sign in to Order'}
        </Button>
      </div>

      {/* Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-poppins">
              Order: {product.name} ({quantity} units)
            </DialogTitle>
          </DialogHeader>
          <EnhancedOrderForm
            shopId={product.shop_id}
            shopName={product.shops?.name || 'Unknown Shop'}
            totalAmount={totalAmount}
            onOrderCreated={handleOrderCreated}
            onCancel={() => setIsOrderDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductOrderButton;