import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();

  const handleCheckout = () => {
    // Navigate to checkout page
    window.location.href = '/checkout';
  };

  if (items.length === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Shopping Cart</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-96">
            <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">Your cart is empty</p>
            <p className="text-sm text-gray-400 text-center mt-2">Add some products to get started</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({items.length})</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                <img
                  src={item.product.image || '/placeholder.svg'}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm line-clamp-2">{item.product.name}</h4>
                  <p className="text-pakistani_green-600 font-bold">
                    PKR {item.product.price.toLocaleString()}
                  </p>
                  {item.product.shops && (
                    <p className="text-xs text-gray-500">{item.product.shops.name}</p>
                  )}
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Badge variant="secondary">{item.quantity}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-xl font-bold text-pakistani_green-600">
              PKR {getTotalPrice().toLocaleString()}
            </span>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleCheckout}
              className="w-full"
            >
              Proceed to Checkout
            </Button>
            <Button 
              variant="outline" 
              onClick={clearCart}
              className="w-full"
            >
              Clear Cart
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;