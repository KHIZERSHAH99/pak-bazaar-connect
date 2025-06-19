
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MessageSquare,
  Calendar,
  User,
  Phone,
  MapPin,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { confirmOrder, rejectOrder, getOrderMessages, sendOrderMessage } from '@/lib/orders-enhanced';
import { Order, OrderMessage, OrderStatus, PaymentMethod } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedOrderDetailsProps {
  order: Order;
  onOrderUpdate: (updatedOrder: Order) => void;
}

const EnhancedOrderDetails: React.FC<EnhancedOrderDetailsProps> = ({
  order,
  onOrderUpdate
}) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [wholesalerNotes, setWholesalerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      const orderMessages = await getOrderMessages(order.id);
      setMessages(orderMessages);
    };
    fetchMessages();
  }, [order.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <Package className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    try {
      const updatedOrderData = await confirmOrder(order.id, wholesalerNotes);
      // Cast and ensure proper typing
      const typedOrder: Order = {
        ...updatedOrderData,
        status: updatedOrderData.status as OrderStatus,
        payment_method: updatedOrderData.payment_method as PaymentMethod,
        shops: updatedOrderData.shops ? {
          id: updatedOrderData.shops.id || order.shops?.id || '',
          name: updatedOrderData.shops.name || order.shops?.name || '',
          contact: updatedOrderData.shops.contact || order.shops?.contact || '',
          address: updatedOrderData.shops.address || order.shops?.address || '',
          postal_code: updatedOrderData.shops.postal_code || order.shops?.postal_code || '',
          owner_id: updatedOrderData.shops.owner_id || order.shops?.owner_id || ''
        } : order.shops
      };
      onOrderUpdate(typedOrder);
      toast({
        title: "Order Confirmed",
        description: "The order has been confirmed successfully",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Failed to Confirm Order",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!wholesalerNotes.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this order",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedOrderData = await rejectOrder(order.id, wholesalerNotes);
      // Cast and ensure proper typing
      const typedOrder: Order = {
        ...updatedOrderData,
        status: updatedOrderData.status as OrderStatus,
        payment_method: updatedOrderData.payment_method as PaymentMethod,
        shops: updatedOrderData.shops ? {
          id: updatedOrderData.shops.id || order.shops?.id || '',
          name: updatedOrderData.shops.name || order.shops?.name || '',
          contact: updatedOrderData.shops.contact || order.shops?.contact || '',
          address: updatedOrderData.shops.address || order.shops?.address || '',
          postal_code: updatedOrderData.shops.postal_code || order.shops?.postal_code || '',
          owner_id: updatedOrderData.shops.owner_id || order.shops?.owner_id || ''
        } : order.shops
      };
      onOrderUpdate(typedOrder);
      toast({
        title: "Order Rejected",
        description: "The order has been rejected",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Failed to Reject Order",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const message = await sendOrderMessage(order.id, newMessage);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Failed to Send Message",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const isWholesaler = profile?.role === 'wholesaler';
  const canTakeAction = isWholesaler && order.status === 'pending';

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-poppins">Order #{order.id.slice(0, 8)}</CardTitle>
              <p className="text-gray-600 font-poppins">
                {order.shops?.name} • {new Date(order.created_at!).toLocaleDateString()}
              </p>
            </div>
            <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
              {getStatusIcon(order.status)}
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{order.buyer_name}</p>
                  <p className="text-sm text-gray-600">Buyer</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{order.buyer_phone}</p>
                  <p className="text-sm text-gray-600">Contact Number</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium">{order.buyer_address}</p>
                  <p className="text-sm text-gray-600">Delivery Address</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{order.payment_method?.replace('_', ' ').toUpperCase()}</p>
                  <p className="text-sm text-gray-600">Payment Method</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">PKR {order.total_amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Amount</p>
                </div>
              </div>

              {order.payment_screenshot && (
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowScreenshot(!showScreenshot)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {showScreenshot ? 'Hide' : 'View'} Payment Screenshot
                  </Button>
                </div>
              )}
            </div>
          </div>

          {showScreenshot && order.payment_screenshot && (
            <div className="mt-4 p-4 border rounded-lg">
              <img
                src={`/api/storage/${order.payment_screenshot}`}
                alt="Payment Screenshot"
                className="max-w-full h-auto max-h-96 mx-auto rounded-lg"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wholesaler Actions */}
      {canTakeAction && (
        <Card>
          <CardHeader>
            <CardTitle className="font-poppins">Order Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="wholesalerNotes">Notes (Optional for confirmation, Required for rejection)</Label>
              <Textarea
                id="wholesalerNotes"
                value={wholesalerNotes}
                onChange={(e) => setWholesalerNotes(e.target.value)}
                placeholder="Add any notes about this order..."
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-4">
              <Button
                onClick={handleRejectOrder}
                disabled={isSubmitting}
                variant="outline"
                className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
              >
                {isSubmitting ? 'Processing...' : 'Reject Order'}
              </Button>
              <Button
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
                className="flex-1 bg-pakistani_green-600 hover:bg-pakistani_green-700"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Order'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <MessageSquare className="h-5 w-5" />
            Order Communication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.sender_id === profile?.id
                    ? 'bg-pakistani_green-50 ml-8'
                    : 'bg-gray-50 mr-8'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">
                    {message.profiles?.business_name || message.profiles?.email}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{message.message}</p>
              </div>
            ))}
          </div>

          {/* Send Message */}
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              rows={2}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-pakistani_green-600 hover:bg-pakistani_green-700"
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedOrderDetails;
