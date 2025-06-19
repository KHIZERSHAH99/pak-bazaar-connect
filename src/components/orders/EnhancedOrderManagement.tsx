
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, Clock, X, Upload, MessageSquare } from 'lucide-react';
import { 
  createOrderWithPaymentEnhanced, 
  confirmOrderEnhanced, 
  rejectOrderEnhanced,
  getOrderWithSecurity 
} from '@/lib/orders/core-enhanced';
import { getWholesalerOrders, getSellerOrders } from '@/lib/orders/queries';
import { sendOrderMessage, getOrderMessages } from '@/lib/orders/messaging';
import { PaymentMethod } from '@/lib/types';

interface EnhancedOrderManagementProps {
  userRole: 'wholesaler' | 'seller';
}

export const EnhancedOrderManagement: React.FC<EnhancedOrderManagementProps> = ({ userRole }) => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [messageText, setMessageText] = useState('');
  const queryClient = useQueryClient();

  // Fetch orders based on user role
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders', userRole],
    queryFn: userRole === 'wholesaler' ? getWholesalerOrders : getSellerOrders,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch messages for selected order
  const { data: messages = [] } = useQuery({
    queryKey: ['order-messages', selectedOrder],
    queryFn: () => selectedOrder ? getOrderMessages(selectedOrder) : [],
    enabled: !!selectedOrder,
  });

  // Confirm order mutation
  const confirmMutation = useMutation({
    mutationFn: ({ orderId, notes }: { orderId: string; notes?: string }) => 
      confirmOrderEnhanced(orderId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Order Confirmed",
        description: "The order has been successfully confirmed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm order",
        variant: "destructive",
      });
    },
  });

  // Reject order mutation
  const rejectMutation = useMutation({
    mutationFn: ({ orderId, notes }: { orderId: string; notes?: string }) => 
      rejectOrderEnhanced(orderId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Order Rejected",
        description: "The order has been rejected.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject order",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ orderId, message }: { orderId: string; message: string }) => 
      sendOrderMessage(orderId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-messages', selectedOrder] });
      setMessageText('');
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

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

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const handleConfirmOrder = (orderId: string, notes?: string) => {
    confirmMutation.mutate({ orderId, notes });
  };

  const handleRejectOrder = (orderId: string, notes?: string) => {
    rejectMutation.mutate({ orderId, notes });
  };

  const handleSendMessage = () => {
    if (!selectedOrder || !messageText.trim()) return;
    sendMessageMutation.mutate({ orderId: selectedOrder, message: messageText.trim() });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Loading orders...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Failed to load orders</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {userRole === 'wholesaler' ? 'Manage Orders' : 'My Orders'}
          </CardTitle>
          <CardDescription>
            {userRole === 'wholesaler' 
              ? 'Review and manage orders from sellers' 
              : 'Track your orders and communicate with wholesalers'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({orders.filter(o => o.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="confirmed">
                Confirmed ({orders.filter(o => o.status === 'confirmed').length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({orders.filter(o => o.status === 'rejected').length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({orders.filter(o => o.status === 'completed').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-6">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No orders found</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                              {getStatusBadge(order.status)}
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><strong>Amount:</strong> Rs. {order.total_amount?.toLocaleString()}</p>
                              <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                              {userRole === 'wholesaler' && order.buyer_name && (
                                <p><strong>Buyer:</strong> {order.buyer_name}</p>
                              )}
                              {order.payment_method && (
                                <p><strong>Payment:</strong> {order.payment_method.replace('_', ' ').toUpperCase()}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order.id)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Messages
                            </Button>

                            {userRole === 'wholesaler' && order.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleConfirmOrder(order.id)}
                                  disabled={confirmMutation.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Confirm
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRejectOrder(order.id)}
                                  disabled={rejectMutation.isPending}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {order.wholesaler_notes && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm"><strong>Notes:</strong> {order.wholesaler_notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Order Messages Modal */}
      {selectedOrder && (
        <Card>
          <CardHeader>
            <CardTitle>Order Messages</CardTitle>
            <CardDescription>
              Communicate about order #{selectedOrder.slice(0, 8)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="max-h-64 overflow-y-auto space-y-2 p-4 border rounded-lg">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center">No messages yet</p>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="p-3 rounded-lg bg-gray-50">
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  className="min-h-[80px]"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                >
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
