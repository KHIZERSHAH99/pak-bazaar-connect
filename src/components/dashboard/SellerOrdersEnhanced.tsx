
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getSellerOrders } from '@/lib/orders-enhanced';
import { getCurrentUser } from '@/lib/auth';
import { Order, OrderStatus, PaymentMethod } from '@/lib/types';
import EnhancedOrderForm from '@/components/payment/EnhancedOrderForm';
import DeliveryConfirmation from '@/components/orders/DeliveryConfirmation';
import OrderStats from '@/components/orders/OrderStats';
import OrderFilters from '@/components/orders/OrderFilters';
import OrderCard from '@/components/orders/OrderCard';
import EmptyOrdersState from '@/components/orders/EmptyOrdersState';
import { useOrderFilters } from '@/hooks/useOrderFilters';
import { useOrderCounts } from '@/hooks/useOrderCounts';
import { checkAccountSuspension } from '@/lib/enhanced-payment';

const SellerOrdersEnhanced: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isAccountSuspended, setIsAccountSuspended] = useState(false);
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
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');
        const [orderData, suspended] = await Promise.all([
          getSellerOrders(user.id),
          checkAccountSuspension()
        ]);
        
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
        setIsAccountSuspended(suspended);
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

    fetchData();
  }, []);

  const handleOrderCreated = (orderId: string) => {
    setShowOrderForm(false);
    toast({
      title: "Order Created Successfully",
      description: "Your order has been submitted and is pending confirmation",
      variant: "default"
    });
    // Refresh orders
    window.location.reload();
  };

  const handleDeliveryConfirmed = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'completed', delivered_at: new Date().toISOString() }
        : order
    ));
    setSelectedOrder(null);
  };

  if (isAccountSuspended) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-red-800 mb-4 font-poppins">
            Account Suspended
          </h2>
          <p className="text-red-700 font-poppins">
            Your account is suspended due to unpaid commission. Please clear your dues to regain access.
          </p>
        </div>
      </div>
    );
  }

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
            <div key={order.id} className="space-y-4">
              <OrderCard
                order={order}
                onViewOrder={(order) => setSelectedOrder(order)}
                showReorderButton={false}
                userRole="seller"
              />
              
              {/* Show delivery confirmation for confirmed orders */}
              {order.status === 'confirmed' && (
                <DeliveryConfirmation
                  order={order}
                  onDeliveryConfirmed={handleDeliveryConfirmed}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-poppins">Create New Order</DialogTitle>
          </DialogHeader>
          <EnhancedOrderForm
            shopId=""
            shopName=""
            onOrderCreated={handleOrderCreated}
            onCancel={() => setShowOrderForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerOrdersEnhanced;
