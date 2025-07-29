import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShoppingCart, 
  Search, 
  AlertTriangle, 
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  Truck,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextFixed';
import { useToast } from '@/hooks/use-toast';
import { Order, OrderStatus } from '@/lib/types';
import { 
  getEnhancedOrdersForWholesaler, 
  getEnhancedOrdersForSeller,
  getOrderAnalytics,
  updateOrderStatusEnhanced
} from '@/lib/orders/enhanced-management';
import EnhancedOrderCard from './EnhancedOrderCard';
import OrderStatusTracker from './OrderStatusTracker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const EnhancedOrderManagement: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  const userRole = profile?.role as 'wholesaler' | 'seller';

  useEffect(() => {
    if (userRole && ['wholesaler', 'seller'].includes(userRole)) {
      fetchOrders();
      fetchAnalytics();
    }
  }, [userRole]);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter, activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let fetchedOrders: Order[] = [];
      
      if (userRole === 'wholesaler') {
        fetchedOrders = await getEnhancedOrdersForWholesaler();
      } else if (userRole === 'seller') {
        fetchedOrders = await getEnhancedOrdersForSeller();
      }
      
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const analyticsData = await getOrderAnalytics(userRole);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    if (activeTab !== 'all') {
      if (activeTab === 'attention') {
        filtered = filtered.filter(order => order.requires_attention);
      } else if (activeTab === 'active') {
        filtered = filtered.filter(order => 
          !['completed', 'rejected', 'returned'].includes(order.status)
        );
      } else {
        filtered = filtered.filter(order => order.status === activeTab);
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shops?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatusEnhanced(orderId, newStatus);
      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus}`,
      });
      fetchOrders();
      fetchAnalytics();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const getTabCount = (status: string) => {
    if (status === 'all') return orders.length;
    if (status === 'attention') return orders.filter(o => o.requires_attention).length;
    if (status === 'active') return orders.filter(o => !['completed', 'rejected', 'returned'].includes(o.status)).length;
    return orders.filter(o => o.status === status).length;
  };

  if (!['wholesaler', 'seller'].includes(userRole)) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Access denied. Please contact support.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">
          Enhanced Order Management
        </h1>
        <Button onClick={fetchOrders} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Total Orders</p><p className="text-2xl font-bold">{analytics.total}</p></div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div></CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Total Value</p><p className="text-2xl font-bold">Rs. {analytics.totalValue?.toLocaleString()}</p></div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div></CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Active Orders</p><p className="text-2xl font-bold">{analytics.pending + analytics.confirmed + analytics.processing + analytics.shipped}</p></div>
              <Package className="h-8 w-8 text-purple-500" />
            </div></CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Needs Attention</p><p className="text-2xl font-bold text-red-600">{analytics.requiresAttention}</p></div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div></CardContent></Card>
        </div>
      )}

      <Card><CardContent className="p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="all">All ({getTabCount('all')})</TabsTrigger>
          <TabsTrigger value="attention"><AlertTriangle className="h-4 w-4" />Attention ({getTabCount('attention')})</TabsTrigger>
          <TabsTrigger value="active">Active ({getTabCount('active')})</TabsTrigger>
          <TabsTrigger value="completed"><CheckCircle className="h-4 w-4" />Completed ({getTabCount('completed')})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="mt-2 text-gray-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card><CardContent className="p-8 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No orders found.</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <EnhancedOrderCard
                  key={order.id}
                  order={order}
                  onViewOrder={handleViewOrder}
                  onStatusUpdate={handleStatusUpdate}
                  userRole={userRole}
                  showActions={userRole === 'wholesaler'}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Order Details - #{selectedOrder?.id.slice(0, 8)}</DialogTitle></DialogHeader>
          {selectedOrder && <OrderStatusTracker order={selectedOrder} statusHistory={selectedOrder.status_history || []} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedOrderManagement;