import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User, Clock } from 'lucide-react';
import { getUserConversations } from '@/lib/messaging-db';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  selectedConversationId
}) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
    
    // Subscribe to conversation updates
    const channel = supabase
      .channel('conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchConversations = async () => {
    try {
      const convos = await getUserConversations();
      
      // Fetch participant details for each conversation
      const conversationsWithDetails = await Promise.all(
        convos.map(async (conv) => {
          const { data: buyerProfile } = await supabase
            .from('profiles')
            .select('business_name, email')
            .eq('id', conv.buyer_id)
            .single();
            
          const { data: sellerProfile } = await supabase
            .from('profiles')
            .select('business_name, email')
            .eq('id', conv.seller_id)
            .single();

          return {
            ...conv,
            buyer_name: buyerProfile?.business_name || buyerProfile?.email || 'Unknown',
            seller_name: sellerProfile?.business_name || sellerProfile?.email || 'Unknown'
          };
        })
      );
      
      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No conversations yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Start a conversation by messaging a seller or buyer
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversationId === conv.id ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {conv.seller_name} ↔ {conv.buyer_name}
                  </span>
                </div>
                {conv.last_message_at && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                  </div>
                )}
              </div>
              
              {conv.last_message && (
                <p className="text-sm text-gray-600 truncate">
                  {conv.last_message}
                </p>
              )}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ConversationList;