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
        
        // Safely process and validate the raw data into proper Order objects
        const processedOrders: Order[] = [];
        
        for (const item of orderData) {
          // Check if item is valid and has required properties - with proper type guard
          if (!item || typeof item !== 'object' || !('id' in item)) {
            console.warn('Invalid order item:', item);
            continue;
          }

          // Type assertion after validation - we know item is not null here
          const validItem = item as NonNullable<typeof item> & Record<string, any>;
          
          try {
            const order: Order = {
              id: String(validItem.id || ''),
              buyer_id: String(validItem.buyer_id || ''),
              shop_id: String(validItem.shop_id || ''),
              total_amount: Number(validItem.total_amount) || 0,
              status: (validItem.status || 'pending') as OrderStatus,
              payment_method: (validItem.payment_method || 'bank_transfer') as PaymentMethod,
              buyer_name: validItem.buyer_name || null,
              buyer_phone: validItem.buyer_phone || null,
              buyer_address: validItem.buyer_address || null,
              payment_screenshot: validItem.payment_screenshot || null,
              screenshot_uploaded_at: validItem.screenshot_uploaded_at || null,
              created_at: validItem.created_at || null,
              confirmed_at: validItem.confirmed_at || null,
              rejected_at: validItem.rejected_at || null,
              wholesaler_notes: validItem.wholesaler_notes || null,
              commission_id: validItem.commission_id || null,
              shops: (validItem.shops && typeof validItem.shops === 'object' && validItem.shops !== null) ? {
                id: String(validItem.shops.id || ''),
                name: String(validItem.shops.name || ''),
                contact: String(validItem.shops.contact || ''),
                address: String(validItem.shops.address || ''),
                postal_code: String(validItem.shops.postal_code || ''),
                owner_id: String(validItem.shops.owner_id || '')
              } : undefined
            };
            
            processedOrders.push(order);
          } catch (processError) {
            console.error('Error processing order item:', processError, item);
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

  const handleViewOrder = async (order: Order) => {
    try {
      // Fetch full order details
      const fullOrders = await getWholesalerOrders(true);
      const fullOrderData = fullOrders.find((o: any) => o && o.id === order.id);
        
      if (!fullOrderData || typeof fullOrderData !== 'object' || !('id' in fullOrderData)) {
        throw new Error('Order details not found');
      }

      // Type assertion after validation - we know fullOrderData is not null here
      const validFullOrderData = fullOrderData as NonNullable<typeof fullOrderData> & Record<string, any>;
      
      const typedOrder: Order = {
        id: String(validFullOrderData.id || order.id),
        buyer_id: String(validFullOrderData.buyer_id || order.buyer_id),
        shop_id: String(validFullOrderData.shop_id || order.shop_id),
        total_amount: Number(validFullOrderData.total_amount) || order.total_amount,
        status: (validFullOrderData.status || 'pending') as OrderStatus,
        payment_method: (validFullOrderData.payment_method || 'bank_transfer') as PaymentMethod,
        buyer_name: validFullOrderData.buyer_name || order.buyer_name,
        buyer_phone: validFullOrderData.buyer_phone || order.buyer_phone,
        buyer_address: validFullOrderData.buyer_address || order.buyer_address,
        payment_screenshot: validFullOrderData.payment_screenshot || order.payment_screenshot,
        screenshot_uploaded_at: validFullOrderData.screenshot_uploaded_at || order.screenshot_uploaded_at,
        created_at: validFullOrderData.created_at || order.created_at,
        confirmed_at: validFullOrderData.confirmed_at || order.confirmed_at,
        rejected_at: validFullOrderData.rejected_at || order.rejected_at,
        wholesaler_notes: validFullOrderData.wholesaler_notes || order.wholesaler_notes,
        commission_id: validFullOrderData.commission_id || order.commission_id,
        shops: (validFullOrderData.shops && typeof validFullOrderData.shops === 'object' && validFullOrderData.shops !== null) ? {
          id: String(validFullOrderData.shops.id || order.shops?.id || ''),
          name: String(validFullOrderData.shops.name || order.shops?.name || ''),
          contact: String(validFullOrderData.shops.contact || order.shops?.contact || ''),
          address: String(validFullOrderData.shops.address || order.shops?.address || ''),
          postal_code: String(validFullOrderData.shops.postal_code || order.shops?.postal_code || ''),
          owner_id: String(validFullOrderData.shops.owner_id || order.shops?.owner_id || '')
        } : order.shops,
        profiles: (validFullOrderData.profiles && typeof validFullOrderData.profiles === 'object' && validFullOrderData.profiles !== null) ? 
          validFullOrderData.profiles : order.profiles
      };
      setSelectedOrder(typedOrder);
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
