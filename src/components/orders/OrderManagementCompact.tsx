
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, CheckCircle, X, Clock, MessageSquare } from 'lucide-react';
import { getWholesalerOrders, getSellerOrders } from '@/lib/orders/queries';
import { confirmOrder, rejectOrder } from '@/lib/orders/core';
import { toast } from '@/hooks/use-toast';
import { useOrderCounts } from '@/hooks/useOrderCounts';
import { useOrderFilters } from '@/hooks/useOrderFilters';
import OrderFilters from './OrderFilters';
import OrderStats from './OrderStats';

interface OrderManagementCompactProps {
  userRole: 'wholesaler' | 'seller';
}

const OrderManagementCompact: React.FC<OrderManagementCompactProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState('pending');

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['orders', userRole],
    queryFn: () => userRole === 'wholesaler' ? getWholesalerOrders() : getSellerOrders(),
    refetchInterval: 30000,
  });

  const orderCounts = useOrderCounts(orders);
  const { filteredOrders, searchTerm, setSearchTerm, statusFilter, setStatusFilter } = useOrderFilters({
    orders,
    searchFields: ['buyer_name', 'shop_name', 'id']
  });

  const handleConfirmOrder = async (orderId: string) => {
    try {
      await confirmOrder(orderId);
      toast({ title: "Order Confirmed", description: "Order has been confirmed successfully." });
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await rejectOrder(orderId);
      toast({ title: "Order Rejected", description: "Order has been rejected." });
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, text: 'Pending' },
      confirmed: { variant: 'default' as const, icon: CheckCircle, text: 'Confirmed' },
      rejected: { variant: 'destructive' as const, icon: X, text: 'Rejected' },
      completed: { variant: 'default' as const, icon: CheckCircle, text: 'Completed' },
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {userRole === 'wholesaler' ? 'Order Management' : 'My Orders'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderStats counts={orderCounts} />
          <OrderFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
          
          <div className="mt-4 space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders found</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">#{order.id.slice(0, 8)}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Amount: Rs. {order.total_amount?.toLocaleString()}</p>
                          <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {userRole === 'wholesaler' && order.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleConfirmOrder(order.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectOrder(order.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagementCompact;
