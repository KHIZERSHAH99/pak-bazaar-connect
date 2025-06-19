
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Search, Eye, Calendar, User, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getWholesalerOrders } from '@/lib/orders-enhanced';
import { Order, OrderStatus, PaymentMethod } from '@/lib/types';
import EnhancedOrderDetails from '@/components/orders/EnhancedOrderDetails';

const WholesalerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orderData = await getWholesalerOrders(false);
        console.log('Raw order data:', orderData);
        
        // Check if data is valid and not an error
        if (!Array.isArray(orderData)) {
          console.error('Invalid order data received:', orderData);
          setOrders([]);
          setFilteredOrders([]);
          return;
        }
        
        // Cast and ensure proper typing for valid data
        const typedOrders: Order[] = orderData
          .filter((order: any) => order && typeof order === 'object' && !order.error)
          .map((order: any) => ({
            id: order.id || '',
            buyer_id: order.buyer_id || '',
            shop_id: order.shop_id || '',
            total_amount: order.total_amount || 0,
            status: (order.status || 'pending') as OrderStatus,
            payment_method: (order.payment_method || 'bank_transfer') as PaymentMethod,
            buyer_name: order.buyer_name || null,
            buyer_phone: order.buyer_phone || null,
            buyer_address: order.buyer_address || null,
            payment_screenshot: order.payment_screenshot || null,
            screenshot_uploaded_at: order.screenshot_uploaded_at || null,
            created_at: order.created_at || null,
            confirmed_at: order.confirmed_at || null,
            rejected_at: order.rejected_at || null,
            wholesaler_notes: order.wholesaler_notes || null,
            commission_id: order.commission_id || null,
            shops: order.shops ? {
              id: order.shops.id || '',
              name: order.shops.name || '',
              contact: order.shops.contact || '',
              address: order.shops.address || '',
              postal_code: order.shops.postal_code || '',
              owner_id: order.shops.owner_id || ''
            } : undefined
          }));
        
        console.log('Processed orders:', typedOrders);
        setOrders(typedOrders);
        setFilteredOrders(typedOrders);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Failed to Load Orders",
          description: error.message || 'An error occurred while loading orders',
          variant: "destructive"
        });
        setOrders([]);
        setFilteredOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewOrder = async (order: Order) => {
    try {
      // Fetch full order details
      const fullOrders = await getWholesalerOrders(true);
      
      if (!Array.isArray(fullOrders)) {
        throw new Error('Failed to fetch full order details');
      }
      
      const fullOrderData = fullOrders
        .filter((o: any) => o && typeof o === 'object' && !o.error)
        .find((o: any) => o.id === order.id);
        
      if (fullOrderData) {
        // Cast and ensure proper typing
        const typedOrder: Order = {
          id: fullOrderData.id || order.id,
          buyer_id: fullOrderData.buyer_id || order.buyer_id,
          shop_id: fullOrderData.shop_id || order.shop_id,
          total_amount: fullOrderData.total_amount || order.total_amount,
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

  const getOrderCounts = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      completed: orders.filter(o => o.status === 'completed').length,
      rejected: orders.filter(o => o.status === 'rejected').length
    };
  };

  const counts = getOrderCounts();

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">Incoming Orders</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">Incoming Orders</h1>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-pakistani_green-600">{counts.total}</p>
            <p className="text-sm text-gray-600 font-poppins">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
            <p className="text-sm text-gray-600 font-poppins">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{counts.confirmed}</p>
            <p className="text-sm text-gray-600 font-poppins">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{counts.completed}</p>
            <p className="text-sm text-gray-600 font-poppins">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
            <p className="text-sm text-gray-600 font-poppins">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by buyer name or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-xl font-medium text-gray-600 mb-2 font-poppins">
              {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
            </p>
            <p className="text-gray-500 font-poppins">
              {orders.length === 0 
                ? 'Orders from retailers will appear here once they start purchasing from your shops.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg font-poppins">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-gray-600 font-poppins">{order.shops?.name || 'Unknown Shop'}</p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium font-poppins">{order.buyer_name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Buyer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium font-poppins">{order.buyer_phone || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Contact</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium font-poppins">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">Order Date</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-pakistani_green-600 font-poppins">
                      PKR {order.total_amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleViewOrder(order)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
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

export default WholesalerOrders;
