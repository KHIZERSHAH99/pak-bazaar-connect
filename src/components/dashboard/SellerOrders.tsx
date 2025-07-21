
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getSellerOrders, reusePreviousOrder } from '@/lib/orders-enhanced';
import { getCurrentUser } from '@/lib/auth';
import { Order, OrderStatus, PaymentMethod } from '@/lib/types';
import EnhancedOrderDetails from '@/components/orders/EnhancedOrderDetails';
import EnhancedOrderForm from '@/components/orders/EnhancedOrderForm';
import OrderReuseDialog from '@/components/orders/OrderReuseDialog';
import SecurityWarning from '@/components/orders/SecurityWarning';
import OrderStats from '@/components/orders/OrderStats';
import OrderFilters from '@/components/orders/OrderFilters';
import OrderCard from '@/components/orders/OrderCard';
import EmptyOrdersState from '@/components/orders/EmptyOrdersState';
import { useOrderFilters } from '@/hooks/useOrderFilters';
import { useOrderCounts } from '@/hooks/useOrderCounts';

const SellerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReorder, setShowReorder] = useState(false);
  const [showReuseDialog, setShowReuseDialog] = useState(false);
  const [reorderData, setReorderData] = useState<any>(null);
  const { toast } = useToast();

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredOrders
  } = useOrderFilters({
    orders,
    searchFields: ['shop_name', 'id']
  });

  const counts = useOrderCounts(orders);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');
        const orderData = await getSellerOrders(user.id);
        // Cast and ensure proper typing
        const typedOrders: Order[] = orderData.map((order: any) => ({
          ...order,
          status: order.status as OrderStatus,
          payment_method: order.payment_method as PaymentMethod,
          shops: order.shops ? {
            id: order.shops.id,
            name: order.shops.name,
            contact: order.shops.contact || '',
            address: order.shops.address || '',
            postal_code: order.shops.postal_code || '',
            owner_id: order.shops.owner_id
          } : undefined
        }));
        setOrders(typedOrders);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Failed to Load Orders",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleReorder = async (order: Order) => {
    setSelectedOrder(order);
    setShowReuseDialog(true);
  };

  const handleReuseOrder = (orderData: any) => {
    setReorderData(orderData);
    setShowReorder(true);
  };

  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrders(prev => prev.map(order => 
      order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
    ));
    setSelectedOrder(updatedOrder);
  };

  const handleReorderComplete = (orderId: string) => {
    setShowReorder(false);
    setReorderData(null);
    setShowReuseDialog(false);
    toast({
      title: "Reorder Successful",
      description: "Your new order has been placed successfully",
      variant: "default"
    });
    // Refresh orders
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">My Orders</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-20 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">My Orders</h1>
      </div>

      <SecurityWarning type="general" />

      <OrderStats counts={counts} />

      <OrderFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        searchPlaceholder="Search by shop name or order ID..."
      />

      {filteredOrders.length === 0 ? (
        <EmptyOrdersState hasOrders={orders.length > 0} userRole="seller" />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onViewOrder={handleViewOrder}
              onReorder={handleReorder}
              showReorderButton={true}
              userRole="seller"
            />
          ))}
        </div>
      )}

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-poppins">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <SecurityWarning type="verification" />
              <EnhancedOrderDetails
                order={selectedOrder}
                onOrderUpdate={handleOrderUpdate}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedOrder && (
        <OrderReuseDialog
          open={showReuseDialog}
          onOpenChange={setShowReuseDialog}
          previousOrder={selectedOrder}
          onReuseOrder={handleReuseOrder}
        />
      )}

      <Dialog open={showReorder} onOpenChange={setShowReorder}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-poppins">Reorder from {reorderData?.shopName}</DialogTitle>
          </DialogHeader>
          {reorderData && (
            <div className="space-y-4">
              <SecurityWarning type="payment" />
              <EnhancedOrderForm
                shopId={reorderData.shopId}
                shopName={reorderData.shopName}
                totalAmount={reorderData.totalAmount}
                onOrderCreated={handleReorderComplete}
                onCancel={() => setShowReorder(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerOrders;
