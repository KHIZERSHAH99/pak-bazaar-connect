import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createOrder, getProductsByShopPublic, getShopById } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { useAuth } from '@/contexts/AuthContextFixed';

const ShopProducts: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const [products, setProducts] = useState<any[]>([]);
  const [orderQuantities, setOrderQuantities] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Correct useQuery usage and typing
  const { data: shop, isLoading: isShopLoading } = useQuery({
    queryKey: ['shop', shopId],
    queryFn: () => getShopById(shopId ?? ''),
    enabled: !!shopId,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      if (!shopId) return;
      setLoading(true);
      try {
        const data = await getProductsByShopPublic(shopId);
        setProducts(data);
        const initialQuantities: { [key: string]: number } = {};
        data.forEach((product: any) => {
          initialQuantities[product.id] = 0;
        });
        setOrderQuantities(initialQuantities);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast({
          title: "Failed to load products",
          description: "There was an error fetching the products for this shop.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [shopId, toast]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    setOrderQuantities(prev => ({ ...prev, [productId]: quantity }));
  };

  const calculateTotalAmount = () => {
    let total = 0;
    products.forEach((product: any) => {
      total += (orderQuantities[product.id] || 0) * product.price;
    });
    return total;
  };

  const placeOrder = async () => {
    if (!shopId) {
      toast({
        title: "Shop ID missing",
        description: "The shop ID is missing. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to place an order.",
        variant: "destructive"
      });
      return;
    }

    // Ensure shop object has the correct type and check for owner_id
    if (shop && typeof shop === "object" && "owner_id" in shop && shop.owner_id === user.id) {
      toast({
        title: "Cannot order from your own shop",
        description: "You cannot place an order in your own shop.",
        variant: "destructive"
      });
      return;
    }

    const totalAmount = calculateTotalAmount();

    if (totalAmount <= 0) {
      toast({
        title: "Invalid order amount",
        description: "The total order amount must be greater than zero.",
        variant: "destructive"
      });
      return;
    }

    setIsOrdering(true);
    try {
      // Update: Call createOrder(shopId, totalAmount)
      await createOrder({
        shopId,
        totalAmount,
        paymentMethod: 'bank_transfer',
        buyerName: user?.email || 'Unknown',
        buyerPhone: '',
        buyerAddress: ''
      });
      toast({
        title: "Order placed",
        description: "Your order has been placed successfully.",
        variant: "success"
      });
      // Reset quantities after successful order
      const resetQuantities: { [key: string]: number } = {};
      products.forEach((product: any) => {
        resetQuantities[product.id] = 0;
      });
      setOrderQuantities(resetQuantities);
    } catch (error: any) {
      toast({
        title: "Failed to place order",
        description: error.message || "There was an error placing your order.",
        variant: "destructive"
      });
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Shop Products</h1>
        {isShopLoading ? (
          <p>Loading shop details...</p>
        ) : shop && typeof shop === 'object' && shop !== null && 'name' in shop && 'address' in shop ? (
          <Card className="mb-6">
            <div className="p-4">
              <h2 className="text-lg font-semibold">{(shop as any).name}</h2>
              <p className="text-gray-600">{(shop as any).address}</p>
            </div>
          </Card>
        ) : (
          <p>Shop not found.</p>
        )}
        <Card>
          {loading ? (
            <p className="p-4">Loading products...</p>
          ) : products.length > 0 ? (
            <>
              <Table>
                <TableCaption>A list of products in the shop.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                        ) : (
                          <span>No Image</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.price}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={orderQuantities[product.id] || 0}
                          onChange={(e) =>
                            handleQuantityChange(product.id, parseInt(e.target.value))
                          }
                          className="w-24"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Separator />
              <div className="p-4 flex items-center justify-between">
                <div className="text-lg font-semibold">
                  Total: Rs {calculateTotalAmount()}
                </div>
                <Button onClick={placeOrder} disabled={isOrdering}>
                  {isOrdering ? (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Place Order
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <p className="p-4">No products found in this shop.</p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

const ShopProductsWithAuth = () => (
  <ProtectedRoute allowedRoles={['seller']}>
    <ShopProducts />
  </ProtectedRoute>
);

export default ShopProductsWithAuth;
