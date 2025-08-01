import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Order, OrderStatus, PaymentMethod } from '@/lib/types';
import { getSellerOrders, getWholesalerOrders } from '@/lib/orders-enhanced';

// Import our new components
import OrderSummaryWidget from './OrderSummaryWidget';
import OrderQuickFilters from './OrderQuickFilters';
import OrderBulkActions from './OrderBulkActions';
import OrderExportTools from './OrderExportTools';
import EnhancedOrderDetails from './EnhancedOrderDetails';
import OrderCard from './OrderCard';
import EmptyOrdersState from './EmptyOrdersState';
import OrderFilters from './OrderFilters';
import { useOrderFilters } from '@/hooks/useOrderFilters';

interface EnhancedOrderManagementSystemProps {
  userRole: 'wholesaler' | 'seller';
}

const EnhancedOrderManagementSystem: React.FC<EnhancedOrderManagementSystemProps> = ({
  userRole
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  const [showExportTools, setShowExportTools] = useState(false);
  const { toast } = useToast();

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredOrders: searchFilteredOrders
  } = useOrderFilters({
    orders,
    searchFields: userRole === 'wholesaler' ? ['buyer_name', 'id'] : ['shop_name', 'id']
  });

  // Apply quick filters on top of search filters
  const getQuickFilteredOrders = () => {
    let filtered = searchFilteredOrders;
    
    switch (activeQuickFilter) {
      case 'today':
        const today = new Date().toDateString();
        filtered = filtered.filter(order => 
          new Date(order.created_at).toDateString() === today
        );
        break;
      case 'high-value':
        filtered = filtered.filter(order => (order.total_amount || 0) > 50000);
        break;
      case 'urgent':
        filtered = filtered.filter(order => 
          order.requires_attention || (
            order.status === 'pending' && 
            new Date(order.created_at).getTime() < Date.now() - 24 * 60 * 60 * 1000
          )
        );
        break;
      default:
        // Apply status filter if not 'all'
        if (activeQuickFilter !== 'all') {
          filtered = filtered.filter(order => order.status === activeQuickFilter);
        }
        break;
    }
    
    return filtered;
  };

  const displayedOrders = getQuickFilteredOrders();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const orderData = userRole === 'wholesaler' 
          ? await getWholesalerOrders()
          : await getSellerOrders();
        
        // Process orders with proper type casting
        const processedOrders: Order[] = (orderData || []).map((order: any) => ({
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
        
        setOrders(processedOrders);
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
  }, [userRole, toast]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrders(prev => prev.map(order => 
      order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
    ));
    setSelectedOrder(updatedOrder);
  };

  const handleBulkOrdersUpdate = (updatedOrders: Order[]) => {
    setOrders(prev => {
      const updated = [...prev];
      updatedOrders.forEach(updatedOrder => {
        const index = updated.findIndex(order => order.id === updatedOrder.id);
        if (index !== -1) {
          updated[index] = { ...updated[index], ...updatedOrder };
        }
      });
      return updated;
    });
  };

  const handleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">
          {userRole === 'wholesaler' ? 'Incoming Orders' : 'My Orders'}
        </h1>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowExportTools(!showExportTools)}
          >
            Export Tools
          </Button>
        </div>
      </div>

      {/* Summary Widgets */}
      <OrderSummaryWidget orders={orders} userRole={userRole} />

      {/* Quick Filters */}
      <OrderQuickFilters
        orders={orders}
        activeFilter={activeQuickFilter}
        onFilterChange={setActiveQuickFilter}
        userRole={userRole}
      />

      {/* Export Tools (Collapsible) */}
      {showExportTools && (
        <OrderExportTools orders={orders} userRole={userRole} />
      )}

      {/* Bulk Actions (Wholesaler only) */}
      {userRole === 'wholesaler' && (
        <OrderBulkActions
          orders={displayedOrders}
          selectedOrders={selectedOrders}
          onSelectionChange={setSelectedOrders}
          onOrdersUpdate={handleBulkOrdersUpdate}
          userRole={userRole}
        />
      )}

      {/* Search and Status Filters */}
      <OrderFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        searchPlaceholder={
          userRole === 'wholesaler' 
            ? "Search by buyer name or order ID..."
            : "Search by shop name or order ID..."
        }
      />

      {/* Orders List */}
      {displayedOrders.length === 0 ? (
        <EmptyOrdersState hasOrders={orders.length > 0} userRole={userRole} />
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((order) => (
            <div key={order.id} className="flex items-center gap-3">
              {userRole === 'wholesaler' && order.status === 'pending' && (
                <Checkbox
                  checked={selectedOrders.includes(order.id)}
                  onCheckedChange={() => handleOrderSelection(order.id)}
                />
              )}
              <div className="flex-1">
                <OrderCard
                  order={order}
                  onViewOrder={handleViewOrder}
                  userRole={userRole}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Dialog */}
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

export default EnhancedOrderManagementSystem;