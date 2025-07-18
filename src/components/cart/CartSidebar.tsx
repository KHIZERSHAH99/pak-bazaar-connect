
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';

const CartSidebar: React.FC = () => {
  const { state, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const handleCheckout = (shopId: string) => {
    navigate(`/checkout/${shopId}`);
  };

  // Group items by shop
  const itemsByShop = state.items.reduce((acc, item) => {
    if (!acc[item.shopId]) {
      acc[item.shopId] = {
        shopName: item.shopName,
        items: [],
        total: 0
      };
    }
    acc[item.shopId].items.push(item);
    acc[item.shopId].total += item.price * item.quantity;
    return acc;
  }, {} as Record<string, { shopName: string; items: typeof state.items; total: number }>);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {state.itemCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {state.itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-96">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({state.itemCount} items)</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {Object.keys(itemsByShop).length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            Object.entries(itemsByShop).map(([shopId, shopData]) => (
              <div key={shopId} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">{shopData.shopName}</h3>
                
                <div className="space-y-3">
                  {shopData.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      {item.productImage && (
                        <img 
                          src={item.productImage} 
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.productName}</h4>
                        <p className="text-xs text-gray-600">Rs. {item.price.toLocaleString()}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= item.moq}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="text-sm w-8 text-center">{item.quantity}</span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total: Rs. {shopData.total.toLocaleString()}</span>
                  <Button 
                    onClick={() => handleCheckout(shopId)}
                    className="bg-pakistani_green-700 hover:bg-pakistani_green-800"
                  >
                    Checkout
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;
