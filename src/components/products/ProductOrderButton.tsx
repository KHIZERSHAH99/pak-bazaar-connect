import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import EnhancedOrderForm from '@/components/orders/EnhancedOrderForm';

interface ProductOrderButtonProps {
  product: Product;
  quantity?: number;
  className?: string;
}

const ProductOrderButton: React.FC<ProductOrderButtonProps> = ({ 
  product, 
  quantity: initialQuantity, 
  className 
}) => {
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(initialQuantity || product.moq || 1);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const totalAmount = (product.price || 0) * quantity;
  const canOrder = user && profile?.role === 'seller'; // Only authenticated sellers can order

  const handleOrderClick = () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please sign in to place orders',
        variant: 'destructive'
      });
      return;
    }

    if (profile?.role !== 'seller') {
      toast({
        title: 'Seller Account Required',
        description: 'Only sellers can place orders. Please switch to seller role.',
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
      {/* Simple Order Button for Product Detail */}
      <Button
        onClick={handleOrderClick}
        disabled={!canOrder}
        className={`bg-primary hover:bg-primary/90 font-poppins ${className || 'w-full'}`}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        Place Order
      </Button>

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