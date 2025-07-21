
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getWholesalerOrders } from '@/lib/orders-enhanced';
import { getCurrentUser } from '@/lib/auth';
import { Order, OrderStatus, PaymentMethod } from '@/lib/types';
import PartialOrderView from '@/components/orders/PartialOrderView';
import OrderConfirmationActions from '@/components/orders/OrderConfirmationActions';
import OrderMessagingSystem from '@/components/orders/OrderMessagingSystem';
import PaymentScreenshot from '@/components/orders/PaymentScreenshot';
import OrderStats from '@/components/orders/OrderStats';
import OrderFilters from '@/components/orders/OrderFilters';
import EmptyOrdersState from '@/components/orders/EmptyOrdersState';
import { useOrderFilters } from '@/hooks/useOrderFilters';
import { useOrderCounts } from '@/hooks/useOrderCounts';

// Helper function to safely convert raw data to Order type
const convertToOrder = (rawData: any): Order | null => {
  if (!rawData || typeof rawData !== 'object' || !rawData.id) {
    return null;
  }

  try {
    return {
      id: String(rawData.id || ''),
      buyer_id: String(rawData.buyer_id || ''),
      shop_id: String(rawData.shop_id || ''),
      total_amount: Number(rawData.total_amount) || 0,
      status: (rawData.status || 'pending') as OrderStatus,
      payment_method: (rawData.payment_method || 'bank_transfer') as PaymentMethod,
      buyer_name: rawData.buyer_name || null,
      buyer_phone: rawData.buyer_phone || null,
      buyer_address: rawData.buyer_address || null,
      payment_screenshot: rawData.payment_screenshot || null,
      screenshot_uploaded_at: rawData.screenshot_uploaded_at || null,
      created_at: rawData.created_at || null,
      confirmed_at: rawData.confirmed_at || null,
      rejected_at: rawData.rejected_at || null,
      wholesaler_notes: rawData.wholesaler_notes || null,
      commission_id: rawData.commission_id || null,
      shops: (rawData.shops && typeof rawData.shops === 'object') ? {
        id: String(rawData.shops.id || ''),
        name: String(rawData.shops.name || ''),
        contact: String(rawData.shops.contact || ''),
        address: String(rawData.shops.address || ''),
        postal_code: String(rawData.shops.postal_code || ''),
        owner_id: String(rawData.shops.owner_id || '')
      } : undefined,
      profiles: rawData.profiles || undefined
    };
  } catch (error) {
    console.error('Error converting raw data to Order:', error, rawData);
    return null;
  }
};

const WholesalerOrdersEnhanced: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [buyerDetailsRevealed, setBuyerDetailsRevealed] = useState(false);
  const { toast } = useToast();

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredOrders
  } = useOrderFilters({
    orders,
    searchFields: ['buyer_name', 'id', 'total_amount']
  });

  const counts = useOrderCounts(orders);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');
        const orderData = await getWholesalerOrders(user.id);
        console.log('Raw order data:', orderData);
        
        // Safely process and validate the raw data into proper Order objects
        const processedOrders: Order[] = [];
        
        if (Array.isArray(orderData)) {
          for (const rawItem of orderData) {
            const convertedOrder = convertToOrder(rawItem);
            if (convertedOrder) {
              processedOrders.push(convertedOrder);
            } else {
              console.warn('Could not convert order item:', rawItem);
            }
          }
        }
        
        console.log('Processed orders:', processedOrders);
        setOrders(processedOrders);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Failed to Load Orders",
          description: error.message || 'An error occurred while loading orders',
          variant: "destructive"
        });
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewFullDetails = async (order: Order) => {
    try {
      // Fetch full order details if needed
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      const fullOrders = await getWholesalerOrders(user.id);
      const fullOrderRaw = Array.isArray(fullOrders) ? fullOrders.find((o: any) => o && o.id === order.id) : null;
        
      if (!fullOrderRaw) {
        throw new Error('Order details not found');
      }

      const fullOrder = convertToOrder(fullOrderRaw);
      if (!fullOrder) {
        throw new Error('Could not process order details');
      }

      setSelectedOrder(fullOrder);
      setBuyerDetailsRevealed(fullOrder.status !== 'pending');
      setShowDetails(true);
    } catch (error: any) {
      console.error('Error loading order details:', error);
      toast({
        title: "Failed to Load Order Details",
        description: error.message || 'An error occurred while loading order details',
        variant: "destructive"
      });
    }
  };

  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrders(prev => prev.map(order => 
      order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
    ));
    setSelectedOrder(updatedOrder);
  };

  const handleBuyerDetailsRevealed = () => {
    setBuyerDetailsRevealed(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-pakistani_green-800 dark:text-emerald-100 font-poppins">Order Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/20 dark:bg-emerald-800/20 backdrop-blur-sm h-20 rounded-lg border border-emerald-200 dark:border-emerald-700"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-pakistani_green-800 dark:text-emerald-100 font-poppins">Order Management</h1>
      </div>

      <OrderStats counts={counts} />

      <OrderFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        searchPlaceholder="Search by order ID, buyer name, or amount..."
      />

      {filteredOrders.length === 0 ? (
        <EmptyOrdersState hasOrders={orders.length > 0} userRole="wholesaler" />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <PartialOrderView
              key={order.id}
              order={order}
              onViewFullDetails={handleViewFullDetails}
            />
          ))}
        </div>
      )}

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-emerald-900/95 backdrop-blur-md border-emerald-200 dark:border-emerald-700">
          <DialogHeader>
            <DialogTitle className="font-poppins text-pakistani_green-800 dark:text-emerald-100">
              Order #{selectedOrder?.id.slice(0, 8)} - Management
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Payment Screenshot */}
              {selectedOrder.payment_screenshot && (
                <PaymentScreenshot paymentScreenshot={selectedOrder.payment_screenshot} />
              )}

              {/* Order Confirmation Actions */}
              <OrderConfirmationActions
                order={selectedOrder}
                onOrderUpdate={handleOrderUpdate}
                onBuyerDetailsRevealed={handleBuyerDetailsRevealed}
              />

              {/* Messaging System */}
              <OrderMessagingSystem
                orderId={selectedOrder.id}
                orderStatus={selectedOrder.status}
                canMessage={selectedOrder.status !== 'pending'}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WholesalerOrdersEnhanced;
