
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserConversations } from '@/lib/messaging';
import ChatWindow from '@/components/messaging/ChatWindow';
import { MessageSquare, User } from 'lucide-react';

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  last_message?: string;
  last_message_at?: string;
  buyer?: { email: string };
  seller?: { email: string };
  products?: { name: string };
}

const Messages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await getUserConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-900 font-poppins">Messages</h1>
        </div>

        {conversations.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2 font-poppins">No conversations yet</h3>
            <p className="text-gray-600 font-poppins">Start messaging sellers or buyers to see conversations here.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Conversations</h3>
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <Button
                      key={conversation.id}
                      variant={selectedConversation === conversation.id ? "default" : "ghost"}
                      className="w-full justify-start p-3 h-auto"
                      onClick={() => {
                        setSelectedConversation(conversation.id);
                        setSelectedRecipient(conversation.buyer?.email || conversation.seller?.email || 'Unknown');
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-8 w-8 bg-gray-100 rounded-full p-1" />
                        <div className="text-left">
                          <p className="font-medium text-sm">
                            {conversation.buyer?.email || conversation.seller?.email}
                          </p>
                          {conversation.products && (
                            <p className="text-xs text-gray-500">{conversation.products.name}</p>
                          )}
                          {conversation.last_message && (
                            <p className="text-xs text-gray-400 truncate">
                              {conversation.last_message}
                            </p>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              {selectedConversation ? (
                <div className="relative h-96">
                  <ChatWindow
                    conversationId={selectedConversation}
                    recipientName={selectedRecipient}
                    onClose={() => setSelectedConversation(null)}
                  />
                </div>
              ) : (
                <Card className="p-12 text-center h-96 flex items-center justify-center">
                  <div>
                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Select a conversation to start messaging</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Messages;
