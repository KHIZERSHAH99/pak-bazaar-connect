
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Truck, Clock, CheckCircle, XCircle, Eye, Download, Search } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  buyerName: string;
  sellerName: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDelivery: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingAddress: string;
}

interface OrderManagementProps {
  userRole: 'buyer' | 'seller' | 'admin';
}

const OrderManagement: React.FC<OrderManagementProps> = ({ userRole }) => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      buyerName: 'Karachi Retailers',
      sellerName: 'Punjab Rice Mills',
      productName: 'Premium Rice Basmati',
      quantity: 1000,
      totalAmount: 8500000,
      status: 'processing',
      orderDate: '2024-01-15',
      expectedDelivery: '2024-01-25',
      paymentStatus: 'paid',
      shippingAddress: 'Main Market, Karachi'
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      buyerName: 'Lahore Garments',
      sellerName: 'Textile Industries Ltd',
      productName: 'Cotton Fabric Rolls',
      quantity: 500,
      totalAmount: 600000,
      status: 'shipped',
      orderDate: '2024-01-10',
      expectedDelivery: '2024-01-20',
      paymentStatus: 'paid',
      shippingAddress: 'Industrial Area, Lahore'
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      buyerName: 'Islamabad Sports',
      sellerName: 'Sports Goods International',
      productName: 'Football Sports Equipment',
      quantity: 200,
      totalAmount: 500000,
      status: 'pending',
      orderDate: '2024-01-18',
      expectedDelivery: '2024-01-28',
      paymentStatus: 'pending',
      shippingAddress: 'Blue Area, Islamabad'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.sellerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const ordersByStatus = {
    all: filteredOrders,
    pending: filteredOrders.filter(o => o.status === 'pending'),
    processing: filteredOrders.filter(o => ['confirmed', 'processing'].includes(o.status)),
    shipped: filteredOrders.filter(o => o.status === 'shipped'),
    completed: filteredOrders.filter(o => o.status === 'delivered'),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-poppins">Order Management</h2>
          <p className="text-gray-600 font-poppins">
            {userRole === 'buyer' ? 'Track your orders' : userRole === 'seller' ? 'Manage incoming orders' : 'Monitor all orders'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Order Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({ordersByStatus.all.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({ordersByStatus.pending.length})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({ordersByStatus.processing.length})</TabsTrigger>
          <TabsTrigger value="shipped">Shipped ({ordersByStatus.shipped.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({ordersByStatus.completed.length})</TabsTrigger>
        </TabsList>

        {Object.entries(ordersByStatus).map(([status, orderList]) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {orderList.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg font-poppins">{order.orderNumber}</h3>
                      <p className="text-gray-600 font-poppins">{order.productName}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 font-poppins">
                        {userRole === 'seller' ? 'Buyer' : 'Seller'}
                      </p>
                      <p className="font-medium font-poppins">
                        {userRole === 'seller' ? order.buyerName : order.sellerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-poppins">Quantity</p>
                      <p className="font-medium font-poppins">{order.quantity.toLocaleString()} units</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-poppins">Order Date</p>
                      <p className="font-medium font-poppins">{order.orderDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-poppins">Expected Delivery</p>
                      <p className="font-medium font-poppins">{order.expectedDelivery}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-2xl font-bold text-primary font-poppins">
                        PKR {order.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {userRole === 'seller' && order.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                          >
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                            className="bg-pakistani_green-600 hover:bg-pakistani_green-700"
                          >
                            Accept
                          </Button>
                        </>
                      )}
                      {userRole === 'seller' && order.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(order.id, 'processing')}
                          className="bg-pakistani_green-600 hover:bg-pakistani_green-700"
                        >
                          Start Processing
                        </Button>
                      )}
                      {userRole === 'seller' && order.status === 'processing' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(order.id, 'shipped')}
                          className="bg-pakistani_green-600 hover:bg-pakistani_green-700"
                        >
                          Mark as Shipped
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Invoice
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default OrderManagement;
