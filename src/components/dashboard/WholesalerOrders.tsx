
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getWholesalerOrders } from '@/lib/orders-enhanced';
import { Order, OrderStatus, PaymentMethod } from '@/lib/types';
import EnhancedOrderDetails from '@/components/orders/EnhancedOrderDetails';
import OrderStats from '@/components/orders/OrderStats';
import OrderFilters from '@/components/orders/OrderFilters';
import OrderCard from '@/components/orders/OrderCard';
import EmptyOrdersState from '@/components/orders/EmptyOrdersState';
import BackendTestButton from '@/components/orders/BackendTestButton';
import { useOrderFilters } from '@/hooks/useOrderFilters';
import { useOrderCounts } from '@/hooks/useOrderCounts';

const WholesalerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredOrders
  } = useOrderFilters({
    orders,
    searchFields: ['buyer_name', 'id']
  });

  const counts = useOrderCounts(orders);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orderData = await getWholesalerOrders(false);
        console.log('Raw order data:', orderData);
        
        // Safely process the raw data into proper Order objects
        const processedOrders: Order[] = orderData
          .filter((item: any) => item && typeof item === 'object' && item.id)
          .map((item: any) => ({
            id: item.id || '',
            buyer_id: item.buyer_id || '',
            shop_id: item.shop_id || '',
            total_amount: Number(item.total_amount) || 0,
            status: (item.status || 'pending') as OrderStatus,
            payment_method: (item.payment_method || 'bank_transfer') as PaymentMethod,
            buyer_name: item.buyer_name || null,
            buyer_phone: item.buyer_phone || null,
            buyer_address: item.buyer_address || null,
            payment_screenshot: item.payment_screenshot || null,
            screenshot_uploaded_at: item.screenshot_uploaded_at || null,
            created_at: item.created_at || null,
            confirmed_at: item.confirmed_at || null,
            rejected_at: item.rejected_at || null,
            wholesaler_notes: item.wholesaler_notes || null,
            commission_id: item.commission_id || null,
            shops: item.shops ? {
              id: item.shops.id || '',
              name: item.shops.name || '',
              contact: item.shops.contact || '',
              address: item.shops.address || '',
              postal_code: item.shops.postal_code || '',
              owner_id: item.shops.owner_id || ''
            } : undefined
          }));
        
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

  const handleViewOrder = async (order: Order) => {
    try {
      // Fetch full order details
      const fullOrders = await getWholesalerOrders(true);
      const fullOrderData = fullOrders.find((o: any) => o && o.id === order.id);
        
      if (fullOrderData) {
        // Process the full order data
        const typedOrder: Order = {
          id: fullOrderData.id || order.id,
          buyer_id: fullOrderData.buyer_id || order.buyer_id,
          shop_id: fullOrderData.shop_id || order.shop_id,
          total_amount: Number(fullOrderData.total_amount) || order.total_amount,
          status: (fullOrderData.status || 'pending') as OrderStatus,
          payment_method: (fullOrderData.payment_method || 'bank_transfer') as PaymentMethod,
          buyer_name: fullOrderData.buyer_name || order.buyer_name,
          buyer_phone: fullOrderData.buyer_phone || order.buyer_phone,
          buyer_address: fullOrderData.buyer_address || order.buyer_address,
          payment_screenshot: fullOrderData.payment_screenshot || order.payment_screenshot,
          screenshot_uploaded_at: fullOrderData.screenshot_uploaded_at || order.screenshot_uploaded_at,
          created_at: fullOrderData.created_at || order.created_at,
          confirmed_at: fullOrderData.confirmed_at || order.confirmed_at,
          rejected_at: fullOrderData.rejected_at || order.rejected_at,
          wholesaler_notes: fullOrderData.wholesaler_notes || order.wholesaler_notes,
          commission_id: fullOrderData.commission_id || order.commission_id,
          shops: fullOrderData.shops ? {
            id: fullOrderData.shops.id || order.shops?.id || '',
            name: fullOrderData.shops.name || order.shops?.name || '',
            contact: fullOrderData.shops.contact || order.shops?.contact || '',
            address: fullOrderData.shops.address || order.shops?.address || '',
            postal_code: fullOrderData.shops.postal_code || order.shops?.postal_code || '',
            owner_id: fullOrderData.shops.owner_id || order.shops?.owner_id || ''
          } : order.shops,
          profiles: fullOrderData.profiles || order.profiles
        };
        setSelectedOrder(typedOrder);
        setShowDetails(true);
      } else {
        throw new Error('Order details not found');
      }
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

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">Incoming Orders</h1>
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
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">Incoming Orders</h1>
        <BackendTestButton />
      </div>

      <OrderStats counts={counts} />

      <OrderFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        searchPlaceholder="Search by buyer name or order ID..."
      />

      {filteredOrders.length === 0 ? (
        <EmptyOrdersState hasOrders={orders.length > 0} userRole="wholesaler" />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onViewOrder={handleViewOrder}
              userRole="wholesaler"
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
            <EnhancedOrderDetails
              order={selectedOrder}
              onOrderUpdate={handleOrderUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WholesalerOrders;
