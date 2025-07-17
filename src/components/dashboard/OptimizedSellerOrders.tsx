
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { updateOptimizedOrderStatus } from '@/lib/orders/performance-optimized';
import { Order } from '@/lib/types';
import OptimizedOrderCard from '@/components/orders/OptimizedOrderCard';
import OrderStats from '@/components/orders/OrderStats';
import OrderFilters from '@/components/orders/OrderFilters';
import EmptyOrdersState from '@/components/orders/EmptyOrdersState';
import EnhancedOrderDetails from '@/components/orders/EnhancedOrderDetails';
import { useOrderFilters } from '@/hooks/useOrderFilters';
import { useOptimizedOrders } from '@/hooks/useOptimizedOrders';

const OptimizedSellerOrders: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const { orders, stats, isLoading, invalidateOrders } = useOptimizedOrders({
    userRole: 'seller',
    refreshInterval: 30000
  });

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

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleOrderUpdate = (updatedOrder: Order) => {
    setSelectedOrder(updatedOrder);
    invalidateOrders();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">My Orders</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-20 rounded"></div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-32 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">My Orders</h1>
      </div>

      {stats && <OrderStats counts={stats} />}

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
            <OptimizedOrderCard
              key={order.id}
              order={order}
              onViewOrder={handleViewOrder}
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

export default OptimizedSellerOrders;
