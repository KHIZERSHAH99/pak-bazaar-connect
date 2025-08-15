
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, User, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getOrderMessages, sendOrderMessage } from '@/lib/orders-enhanced';
import { OrderMessage } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

interface OrderMessagingSystemProps {
  orderId: string;
  orderStatus: string;
  canMessage?: boolean;
}

const OrderMessagingSystem: React.FC<OrderMessagingSystemProps> = ({
  orderId,
  orderStatus,
  canMessage = true
}) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const orderMessages = await getOrderMessages(orderId);
        setMessages(orderMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    
    if (isExpanded) {
      fetchMessages();
    }
  }, [orderId, isExpanded]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const message = await sendOrderMessage(orderId, newMessage);
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
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageSenderLabel = (message: OrderMessage) => {
    if (message.sender_id === profile?.id) {
      return 'You';
    }
    return message.profiles?.business_name || message.profiles?.email || 'Other Party';
  };

  const isMyMessage = (message: OrderMessage) => message.sender_id === profile?.id;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-poppins">
            <MessageSquare className="h-5 w-5" />
            Order Communication
            {messages.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {messages.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Message Display Area */}
          <div className="max-h-64 overflow-y-auto space-y-3 border rounded-lg p-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-poppins">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                      isMyMessage(message)
                        ? 'bg-pakistani_green-100 text-pakistani_green-800'
                        : 'bg-white border'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-3 w-3" />
                      <span className="text-xs font-medium">
                        {getMessageSenderLabel(message)}
                      </span>
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input Area */}
          {canMessage && orderStatus !== 'rejected' && (
            <div className="space-y-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="resize-none"
                rows={3}
                disabled={isSending}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500 font-poppins">
                  Messages are private between you and the other party
                </p>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  size="sm"
                  className="bg-pakistani_green-600 hover:bg-pakistani_green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSending ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </div>
          )}

          {orderStatus === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700 font-poppins">
                This order has been rejected. Messaging is no longer available.
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default OrderMessagingSystem;
