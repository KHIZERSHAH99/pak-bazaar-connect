import React, { memo, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, CheckCircle, XCircle, Clock, TrendingUp, RotateCcw, FileText, Download, History } from 'lucide-react';
import { getUnifiedOrders, optimisticUpdateOrderStatus } from '@/lib/orders/unified-queries';
import { reusePreviousOrder } from '@/lib/orders/core';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { generateOrderReceipt } from '@/utils/orderPdf';
import OrderTimeline from '@/components/orders/OrderTimeline';

interface UnifiedOrderManagementProps {
  userRole: 'seller' | 'wholesaler';
}

// Memoized Order Card Component
const OrderCard = memo(({ 
  order, 
  onStatusUpdate,
  onReorder,
  onDownloadReceipt,
  onViewTimeline,
  userRole
}: { 
  order: any; 
  onStatusUpdate: (orderId: string, status: string) => void;
  onReorder: (orderId: string) => void;
  onDownloadReceipt: (order: any) => void;
  onViewTimeline: (orderId: string) => void;
  userRole: 'seller' | 'wholesaler';
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const showReorderButton = userRole === 'seller' && ['completed', 'delivered'].includes(order.status);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{order.shops?.name || 'Order'}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
            </p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-semibold">Rs. {Number(order.total_amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Customer:</span>
            <span>{order.buyer_name || order.profiles?.business_name || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment:</span>
            <span className="capitalize">{order.payment_method?.replace('_', ' ')}</span>
          </div>
          
          {/* Order Notes if present */}
          {order.order_notes && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">Notes:</p>
              <p className="text-sm">{order.order_notes}</p>
            </div>
          )}
          
          {/* Wholesaler actions */}
          {order.status === 'pending' && userRole === 'wholesaler' && (
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                onClick={() => onStatusUpdate(order.id, 'confirmed')}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => onStatusUpdate(order.id, 'rejected')}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}

          {/* Seller reorder button */}
          {showReorderButton && (
            <div className="pt-2 border-t mt-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onReorder(order.id)}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reorder
              </Button>
            </div>
          )}

          {/* PDF & Timeline buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDownloadReceipt(order)}
              className="flex-1 text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Receipt
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onViewTimeline(order.id)}
              className="flex-1 text-xs"
            >
              <History className="h-3 w-3 mr-1" />
              Timeline
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

OrderCard.displayName = 'OrderCard';

// Memoized Stats Component
const OrderStats = memo(({ stats }: { stats: any }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-2xl font-bold">{stats.pending || 0}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">{stats.confirmed || 0}</p>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">{stats.completed || 0}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">Rs. {stats.totalValue?.toLocaleString() || 0}</p>
            <p className="text-xs text-muted-foreground">Total Value</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

OrderStats.displayName = 'OrderStats';

const UnifiedOrderManagement: React.FC<UnifiedOrderManagementProps> = ({ userRole }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [timelineOrderId, setTimelineOrderId] = useState<string | null>(null);

  // Single query for orders and stats with 30-second stale time
  const { data, isLoading } = useQuery({
    queryKey: ['unified-orders', userRole],
    queryFn: () => getUnifiedOrders(userRole),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false
  });

  // Optimistic update mutation
  const updateStatusMutation = useMutation({
    mutationFn: (variables: { orderId: string; status: string }) =>
      optimisticUpdateOrderStatus(variables.orderId, variables.status)(),
    onMutate: async (variables) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['unified-orders', userRole] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['unified-orders', userRole]);

      // Optimistically update
      queryClient.setQueryData(['unified-orders', userRole], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          orders: old.orders.map((o: any) =>
            o.id === variables.orderId ? { ...o, status: variables.status } : o
          )
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['unified-orders', userRole], context?.previousData);
      toast({
        title: 'Update Failed',
        description: 'Could not update order status',
        variant: 'destructive'
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Order Updated',
        description: `Order ${variables.status}`,
      });
    },
    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: ['unified-orders', userRole] });
    }
  });

  const handleStatusUpdate = (orderId: string, status: string) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  const handleReorder = async (orderId: string) => {
    try {
      const orderData = await reusePreviousOrder(orderId);
      // Navigate to shop with order data pre-filled
      toast({
        title: 'Order Data Loaded',
        description: 'Redirecting to create new order with same details...',
      });
      // Store reorder data in sessionStorage for the order form to pick up
      sessionStorage.setItem('reorder_data', JSON.stringify(orderData));
      navigate(`/shop/${orderData.shop_id}`);
    } catch (error: any) {
      toast({
        title: 'Reorder Failed',
        description: error.message || 'Could not load previous order details',
        variant: 'destructive'
      });
    }
  };

  // Memoize filtered orders
  const filteredOrders = useMemo(() => {
    return data?.orders || [];
  }, [data?.orders]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrderStats stats={data?.stats} />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onStatusUpdate={handleStatusUpdate}
              onReorder={handleReorder}
              onDownloadReceipt={generateOrderReceipt}
              onViewTimeline={(id) => setTimelineOrderId(id)}
              userRole={userRole}
            />
          ))
        )}
      </div>

      {/* Timeline Dialog */}
      <Dialog open={!!timelineOrderId} onOpenChange={() => setTimelineOrderId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-poppins">Order Timeline</DialogTitle>
          </DialogHeader>
          {timelineOrderId && <OrderTimeline orderId={timelineOrderId} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default memo(UnifiedOrderManagement);
