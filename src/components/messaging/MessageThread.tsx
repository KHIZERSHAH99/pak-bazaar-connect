import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Paperclip } from 'lucide-react';
import { getConversationMessages, createMessage } from '@/lib/messaging-db';
import { getCurrentUser } from '@/lib/auth';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface MessageThreadProps {
  conversationId: string;
}

const MessageThread: React.FC<MessageThreadProps> = ({ conversationId }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeUser();
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        scrollToBottom();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const initializeUser = async () => {
    const user = await getCurrentUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const fetchMessages = async () => {
    const msgs = await getConversationMessages(conversationId);
    setMessages(msgs);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await createMessage({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: newMessage.trim()
      });
      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Conversation</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.sender_id === currentUserId
                      ? 'bg-pakistani_green-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender_id === currentUserId ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="flex-shrink-0"
              disabled
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="bg-pakistani_green-600 hover:bg-pakistani_green-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageThread;