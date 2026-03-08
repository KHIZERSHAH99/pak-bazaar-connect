
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getOrderMessages, sendOrderMessage } from '@/lib/orders-enhanced';
import { OrderMessage } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

interface OrderMessagingProps {
  orderId: string;
}

const OrderMessaging: React.FC<OrderMessagingProps> = ({ orderId }) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      const orderMessages = await getOrderMessages(orderId);
      setMessages(orderMessages);
    };
    fetchMessages();
  }, [orderId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

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
    }
  };

  return (
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
                  ? 'bg-primary/5 ml-8'
                  : 'bg-muted mr-8'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-sm">
                  {message.profiles?.business_name || message.profiles?.email}
                </span>
                <span className="text-xs text-muted-foreground">
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
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderMessaging;
