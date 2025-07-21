import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShoppingCart } from 'lucide-react';
import EnhancedOrderForm from './EnhancedOrderForm';

interface CreateOrderButtonProps {
  shopId: string;
  shopName: string;
  disabled?: boolean;
}

const CreateOrderButton: React.FC<CreateOrderButtonProps> = ({
  shopId,
  shopName,
  disabled = false
}) => {
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  const handleOrderCreated = (orderId: string) => {
    setIsOrderDialogOpen(false);
    // You could add navigation or additional logic here
  };

  return (
    <>
      <Button
        onClick={() => setIsOrderDialogOpen(true)}
        disabled={disabled}
        className="bg-primary hover:bg-primary/90 w-full"
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        Place Order
      </Button>

      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-poppins">Place Order - {shopName}</DialogTitle>
          </DialogHeader>
          <EnhancedOrderForm
            shopId={shopId}
            shopName={shopName}
            totalAmount={0} // This should be calculated based on selected products
            onOrderCreated={handleOrderCreated}
            onCancel={() => setIsOrderDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateOrderButton;