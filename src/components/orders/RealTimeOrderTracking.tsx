
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, X, Package, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextFixed';

interface OrderTrackingEntry {
  id: string;
  order_id: string;
  status: string;
  notes: string;
  created_at: string;
  created_by: string;
}

interface OrderWithTracking {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  buyer_name: string;
  shops: {
    name: string;
  };
  tracking: OrderTrackingEntry[];
}

interface RealTimeOrderTrackingProps {
  orderId: string;
}

const RealTimeOrderTracking: React.FC<RealTimeOrderTrackingProps> = ({ orderId }) => {
  const { profile } = useAuth();
  const [orderData, setOrderData] = useState<OrderWithTracking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderTracking();
    
    // Set up real-time subscription for order tracking
    const channel = supabase
      .channel('order-tracking')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_tracking',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          console.log('Order tracking update:', payload);
          fetchOrderTracking(); // Refresh data when changes occur
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          console.log('Order update:', payload);
          fetchOrderTracking(); // Refresh data when order status changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const fetchOrderTracking = async () => {
    try {
      setLoading(true);
      
      // Fetch order with tracking data
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          buyer_name,
          shops!inner(name)
        `)
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Error fetching order:', orderError);
        return;
      }

      // Fetch tracking entries
      const { data: tracking, error: trackingError } = await supabase
        .from('order_tracking')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (trackingError) {
        console.error('Error fetching tracking:', trackingError);
        return;
      }

      setOrderData({
        ...order,
        tracking: tracking || []
      });
    } catch (error) {
      console.error('Error in fetchOrderTracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <Package className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      confirmed: 'default',
      rejected: 'destructive',
      completed: 'default',
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!orderData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Order not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Order Tracking</span>
          {getStatusBadge(orderData.status)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Order Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Order ID</p>
                <p className="font-medium">#{orderData.id.slice(0, 8)}</p>
              </div>
              <div>
                <p className="text-gray-600">Amount</p>
                <p className="font-medium">PKR {orderData.total_amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Shop</p>
                <p className="font-medium">{orderData.shops.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Buyer</p>
                <p className="font-medium">{orderData.buyer_name}</p>
              </div>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">Order Timeline</h4>
            
            {/* Initial order creation */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <User className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Order Created</p>
                  <p className="text-xs text-gray-500">
                    {new Date(orderData.created_at).toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-gray-600">Order placed by customer</p>
              </div>
            </div>

            {/* Tracking entries */}
            {orderData.tracking.map((entry, index) => (
              <div key={entry.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(entry.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      Status: {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.created_at).toLocaleString()}
                    </p>
                  </div>
                  {entry.notes && (
                    <p className="text-xs text-gray-600 mt-1">{entry.notes}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Real-time indicator */}
            <div className="flex items-center space-x-2 text-xs text-green-600 mt-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Real-time tracking active</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeOrderTracking;
