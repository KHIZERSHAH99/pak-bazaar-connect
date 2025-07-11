
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContextFixed';
import { supabase } from '@/integrations/supabase/client';
import { getWholesalerOrders, getSellerOrders } from '@/lib/orders/queries';
import { Package, AlertCircle, ShoppingCart, Clock, CheckCircle, X } from 'lucide-react';

interface EnhancedOrderListProps {
  userRole: 'wholesaler' | 'seller';
  onOrderSelect?: (order: any) => void;
}

const EnhancedOrderList: React.FC<EnhancedOrderListProps> = ({ userRole, onOrderSelect }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { profile } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, [userRole, profile, retryCount]);

  const fetchOrders = async () => {
    if (!profile) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let orderData: any[] = [];
      
      if (userRole === 'wholesaler') {
        orderData = await getWholesalerOrders(true);
      } else if (userRole === 'seller') {
        orderData = await getSellerOrders();
      }

      // Defensive data processing
      const processedOrders = (orderData || []).map(order => ({
        ...order,
        // Ensure required fields have fallbacks
        status: order.status || 'pending',
        total_amount: order.total_amount || 0,
        created_at: order.created_at || new Date().toISOString(),
        buyer_name: order.buyer_name || 'Unknown Buyer',
        shops: order.shops || { name: 'Unknown Shop', address: 'N/A' },
        profiles: order.profiles || { email: 'Unknown Email' }
      }));

      setOrders(processedOrders);
      
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setError(error.message || 'Failed to load orders');
      
      // Fallback to empty array to prevent UI crashes
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, text: 'Pending' },
      confirmed: { variant: 'default' as const, icon: CheckCircle, text: 'Confirmed' },
      rejected: { variant: 'destructive' as const, icon: X, text: 'Rejected' },
      completed: { variant: 'default' as const, icon: CheckCircle, text: 'Completed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Orders...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Orders Loading Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p>{error}</p>
              <Button onClick={handleRetry} variant="outline" size="sm">
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {userRole === 'wholesaler' ? 'Order Management' : 'My Orders'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 space-y-4">
            <Package className="h-16 w-16 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Orders Yet
              </h3>
              <p className="text-gray-500">
                {userRole === 'wholesaler' 
                  ? 'Orders from buyers will appear here once they start purchasing from your shop.'
                  : 'Your orders will appear here once you start purchasing from wholesalers.'
                }
              </p>
            </div>
            
            {userRole === 'seller' && (
              <Button className="bg-pakistani_green-600 hover:bg-pakistani_green-700">
                Browse Products
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          {userRole === 'wholesaler' ? 'Order Management' : 'My Orders'} ({orders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <Card 
              key={order.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onOrderSelect?.(order)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">
                        Order #{order.id?.slice(0, 8) || 'Unknown'}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Amount:</strong> PKR {(order.total_amount || 0).toLocaleString()}</p>
                      <p><strong>Date:</strong> {new Date(order.created_at || Date.now()).toLocaleDateString()}</p>
                      
                      {userRole === 'wholesaler' && order.buyer_name && (
                        <p><strong>Buyer:</strong> {order.buyer_name}</p>
                      )}
                      
                      {userRole === 'seller' && order.shops?.name && (
                        <p><strong>Shop:</strong> {order.shops.name}</p>
                      )}
                      
                      {order.payment_method && (
                        <p><strong>Payment:</strong> {order.payment_method.replace('_', ' ').toUpperCase()}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>

                {order.wholesaler_notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm"><strong>Notes:</strong> {order.wholesaler_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedOrderList;
