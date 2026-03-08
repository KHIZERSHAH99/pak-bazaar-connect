import React, { memo, useMemo, useState, useEffect, useCallback } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, CheckCircle, Clock, TrendingUp, Search, Loader2, Bell } from 'lucide-react';
import { getUnifiedOrders, optimisticUpdateOrderStatus, subscribeToOrders } from '@/lib/orders/unified-queries';
import { reusePreviousOrder } from '@/lib/orders/core';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { generateOrderReceipt } from '@/utils/orderPdf';
import OrderTimeline from '@/components/orders/OrderTimeline';
import OrderCardCompact from '@/components/orders/OrderCardCompact';
import OrderStatusConfirmDialog from '@/components/orders/OrderStatusConfirmDialog';

interface UnifiedOrderManagementProps {
  userRole: 'seller' | 'wholesaler';
}

const STATUS_TABS = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'rejected'] as const;

// Memoized Stats
const OrderStats = memo(({ stats }: { stats: any }) => {
  if (!stats) return null;
  const items = [
    { icon: Package, label: 'Total', value: stats.total, color: 'text-muted-foreground' },
    { icon: Clock, label: 'Pending', value: stats.pending || 0, color: 'text-yellow-600' },
    { icon: CheckCircle, label: 'Confirmed', value: stats.confirmed || 0, color: 'text-blue-600' },
    { icon: CheckCircle, label: 'Delivered', value: stats.delivered || 0, color: 'text-green-600' },
    { icon: TrendingUp, label: 'Value', value: `Rs. ${(stats.totalValue || 0).toLocaleString()}`, color: 'text-primary' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="pt-6 text-center">
            <item.icon className={`h-8 w-8 mx-auto mb-2 ${item.color}`} />
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
OrderStats.displayName = 'OrderStats';

const UnifiedOrderManagement: React.FC<UnifiedOrderManagementProps> = ({ userRole }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timelineOrderId, setTimelineOrderId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ orderId: string; status: string } | null>(null);
  const [newOrderCount, setNewOrderCount] = useState(0);

  // Paginated query
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['unified-orders', userRole],
    queryFn: ({ pageParam = 0 }) => getUnifiedOrders(userRole, pageParam),
    getNextPageParam: (lastPage, allPages) => lastPage.hasMore ? allPages.length : undefined,
    initialPageParam: 0,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  // Realtime subscription
  useEffect(() => {
    const unsub = subscribeToOrders(
      userRole,
      () => {
        setNewOrderCount(c => c + 1);
      },
      () => {
        queryClient.invalidateQueries({ queryKey: ['unified-orders', userRole] });
      }
    );
    return unsub;
  }, [userRole, queryClient]);

  const handleRefreshNewOrders = () => {
    setNewOrderCount(0);
    queryClient.invalidateQueries({ queryKey: ['unified-orders', userRole] });
  };

  // Flatten pages
  const allOrders = useMemo((): any[] => {
    return data?.pages.flatMap((p: any) => p.orders) || [];
  }, [data]);

  const stats = data?.pages[0]?.stats;

  // Filter + search
  const filteredOrders = useMemo(() => {
    let orders = allOrders;
    if (activeTab !== 'all') {
      orders = orders.filter(o => o.status === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      orders = orders.filter(o =>
        o.id?.toLowerCase().includes(q) ||
        o.buyer_name?.toLowerCase().includes(q) ||
        o.shops?.name?.toLowerCase().includes(q) ||
        o.profiles?.business_name?.toLowerCase().includes(q)
      );
    }
    return orders;
  }, [allOrders, activeTab, searchQuery]);

  // Status update mutation with optimistic updates
  const updateStatusMutation = useMutation({
    mutationFn: (vars: { orderId: string; status: string; notes?: string }) =>
      optimisticUpdateOrderStatus(vars.orderId, vars.status, vars.notes)(),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ['unified-orders', userRole] });
      const prev = queryClient.getQueryData(['unified-orders', userRole]);
      queryClient.setQueryData(['unified-orders', userRole], (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            orders: page.orders.map((o: any) =>
              o.id === vars.orderId ? { ...o, status: vars.status } : o
            )
          }))
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['unified-orders', userRole], ctx?.prev);
      toast({ title: 'Update Failed', description: 'Could not update order status', variant: 'destructive' });
    },
    onSuccess: (_data, vars) => {
      toast({ title: 'Order Updated', description: `Order ${vars.status}` });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-orders', userRole] });
    }
  });

  const handleStatusUpdate = useCallback((orderId: string, status: string) => {
    setConfirmDialog({ orderId, status });
  }, []);

  const handleConfirmStatusUpdate = useCallback((orderId: string, status: string, notes?: string) => {
    updateStatusMutation.mutate({ orderId, status, notes });
  }, [updateStatusMutation]);

  const handleReorder = useCallback(async (orderId: string) => {
    try {
      const orderData = await reusePreviousOrder(orderId);
      toast({ title: 'Order Data Loaded', description: 'Redirecting to create new order...' });
      sessionStorage.setItem('reorder_data', JSON.stringify(orderData));
      navigate(`/shop/${orderData.shop_id}`);
    } catch (error: any) {
      toast({ title: 'Reorder Failed', description: error.message || 'Could not load previous order', variant: 'destructive' });
    }
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrderStats stats={stats} />

      {/* New order notification banner */}
      {newOrderCount > 0 && (
        <Button variant="outline" className="w-full" onClick={handleRefreshNewOrders}>
          <Bell className="h-4 w-4 mr-2" />
          {newOrderCount} new order{newOrderCount > 1 ? 's' : ''} — Click to refresh
        </Button>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="w-full flex-wrap h-auto">
            {STATUS_TABS.map(tab => (
              <TabsTrigger key={tab} value={tab} className="capitalize text-xs sm:text-sm">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Orders grid */}
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
            <OrderCardCompact
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

      {/* Load More */}
      {hasNextPage && (
        <div className="text-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading...</> : 'Load More Orders'}
          </Button>
        </div>
      )}

      {/* Status Confirm Dialog */}
      {confirmDialog && (
        <OrderStatusConfirmDialog
          open={!!confirmDialog}
          onOpenChange={() => setConfirmDialog(null)}
          orderId={confirmDialog.orderId}
          newStatus={confirmDialog.status}
          onConfirm={handleConfirmStatusUpdate}
        />
      )}

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
