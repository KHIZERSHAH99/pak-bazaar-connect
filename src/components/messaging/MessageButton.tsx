import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import RealTimeChatWindow from './RealTimeChatWindow';
import { createConversation } from '@/lib/messaging';
import { getCurrentUser } from '@/lib/auth';

interface MessageButtonProps {
  sellerId: string;
  sellerName: string;
  productId?: string;
}

const MessageButton: React.FC<MessageButtonProps> = ({ sellerId, sellerName, productId }) => {
  const [showChat, setShowChat] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const handleStartChat = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        alert('Please login to start a conversation');
        return;
      }
      if (user.id === sellerId) {
        alert('You cannot message yourself');
        return;
      }

      const conversation = await createConversation({
        buyer_id: user.id,
        seller_id: sellerId,
        product_id: productId
      });

      setConversationId(conversation.id);
      setShowChat(true);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  return (
    <>
      <Button onClick={handleStartChat} variant="outline" className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Message Seller
      </Button>

      {showChat && conversationId && (
        <RealTimeChatWindow
          conversationId={conversationId}
          recipientName={sellerName}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
};

export default MessageButton;
