
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Eye, EyeOff, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

interface Order {
  id: string;
  total_amount: number;
  payment_method: string;
  payment_screenshot: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_address: string;
  status: string;
  created_at: string;
  wholesaler_notes?: string;
}

export const WholesalerOrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          shops!inner(owner_id)
        `)
        .eq('shops.owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error Loading Orders",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderAction = async (orderId: string, action: 'confirmed' | 'rejected') => {
    setProcessingOrder(orderId);
    try {
      const updateData: any = {
        status: action,
        [`${action === 'confirmed' ? 'confirmed' : 'rejected'}_at`]: new Date().toISOString()
      };

      if (notes[orderId]) {
        updateData.wholesaler_notes = notes[orderId];
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: `Order ${action === 'confirmed' ? 'Confirmed' : 'Rejected'}`,
        description: `The order has been ${action} successfully.`,
      });

      fetchOrders(); // Refresh orders
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const getScreenshotUrl = (path: string) => {
    const { data } = supabase.storage
      .from('payment-screenshots')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-poppins">Order Management</h2>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {orders.filter(o => o.status === 'pending').length} Pending Orders
        </Badge>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground font-poppins">No orders received yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-poppins">
                      Order #{order.id.slice(-8)}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        PKR {order.total_amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      order.status === 'confirmed' ? 'default' : 
                      order.status === 'rejected' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Payment Method & Screenshot */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Payment Method:</p>
                    <p className="text-muted-foreground capitalize">
                      {order.payment_method.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Payment Screenshot:</p>
                    {order.payment_screenshot && (
                      <img
                        src={getScreenshotUrl(order.payment_screenshot)}
                        alt="Payment Screenshot"
                        className="max-w-full h-32 object-contain border rounded"
                      />
                    )}
                  </div>
                </div>

                {/* Buyer Details - Only show if confirmed */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    {order.status === 'confirmed' ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <p className="font-medium">
                      Buyer Details {order.status !== 'confirmed' && '(Hidden until confirmed)'}
                    </p>
                  </div>

                  {order.status === 'confirmed' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">Name:</p>
                        <p>{order.buyer_name}</p>
                      </div>
                      <div>
                        <p className="font-medium">Phone:</p>
                        <p>{order.buyer_phone}</p>
                      </div>
                      {order.buyer_address && (
                        <div className="md:col-span-2">
                          <p className="font-medium">Address:</p>
                          <p>{order.buyer_address}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        Buyer contact details will be revealed once you confirm this order.
                        This protects buyer privacy and prevents off-platform transactions.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Action Buttons for Pending Orders */}
                {order.status === 'pending' && (
                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Notes (Optional for confirmation, Required for rejection)
                      </label>
                      <Textarea
                        value={notes[order.id] || ''}
                        onChange={(e) => setNotes(prev => ({ ...prev, [order.id]: e.target.value }))}
                        placeholder="Add any notes about this order..."
                        rows={2}
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleOrderAction(order.id, 'rejected')}
                        disabled={processingOrder === order.id}
                        variant="outline"
                        className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Order
                      </Button>
                      <Button
                        onClick={() => handleOrderAction(order.id, 'confirmed')}
                        disabled={processingOrder === order.id}
                        className="flex-1 bg-pakistani_green-600 hover:bg-pakistani_green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Order
                      </Button>
                    </div>
                  </div>
                )}

                {/* Show notes if order is processed */}
                {order.wholesaler_notes && order.status !== 'pending' && (
                  <div className="border-t pt-4">
                    <p className="font-medium">Wholesaler Notes:</p>
                    <p className="text-muted-foreground">{order.wholesaler_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
