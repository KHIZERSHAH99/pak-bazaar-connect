import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Search, Loader2, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import NewConversationDialog from './NewConversationDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface ConversationData {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id?: string;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  updated_at?: string;
  other_user?: {
    id: string;
    email: string;
    business_name?: string;
    role: string;
  };
  unread_count: number;
}

interface MessageData {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachment?: string;
  read_at?: string;
  created_at: string;
}

const EnhancedMessaging: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchConversations();

    const channel = supabase
      .channel('messages-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as MessageData;
        if (selectedConversation && newMsg.conversation_id === selectedConversation.id) {
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  // Re-subscribe when selected conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      const convos = data || [];
      if (!convos.length) { setConversations([]); setLoading(false); return; }

      // Batch profile lookups
      const otherUserIds = [...new Set(convos.map(c => c.buyer_id === user.id ? c.seller_id : c.buyer_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, business_name, role')
        .in('id', otherUserIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      // Batch unread counts
      const convIds = convos.map(c => c.id);
      const { data: unreadData } = await supabase
        .from('messages')
        .select('conversation_id', { count: 'exact' })
        .in('conversation_id', convIds)
        .neq('sender_id', user.id)
        .is('read_at', null);

      // Count per conversation
      const unreadMap = new Map<string, number>();
      (unreadData || []).forEach(m => {
        unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) || 0) + 1);
      });

      const result: ConversationData[] = convos.map(conv => {
        const otherId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;
        return {
          ...conv,
          other_user: profileMap.get(otherId) || undefined,
          unread_count: unreadMap.get(conv.id) || 0,
        };
      });

      setConversations(result);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark as read
      if (user) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id)
          .is('read_at', null);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;
    setSendingMessage(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          content: newMessage.trim()
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('conversations')
        .update({
          last_message: newMessage.trim(),
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedConversation.id);

      // Add optimistically (realtime will dedupe)
      setMessages(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data]);
      setNewMessage('');
      fetchConversations();
    } catch (error: any) {
      toast({ title: 'Failed to send message', description: error.message, variant: 'destructive' });
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.other_user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showList = !isMobile || !selectedConversation;
  const showChat = !isMobile || !!selectedConversation;

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center border rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden bg-background">
      {/* Conversations List */}
      {showList && (
        <div className={`${isMobile ? 'w-full' : 'w-1/3'} border-r bg-muted/30 flex flex-col`}>
          <div className="p-4 border-b bg-background">
            <h3 className="font-semibold font-poppins mb-3">Messages</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-poppins">No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="text-xs">
                        {conversation.other_user?.business_name?.split(' ').map(n => n[0]).join('') ||
                         conversation.other_user?.email?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm font-poppins truncate">
                          {conversation.other_user?.business_name || conversation.other_user?.email || 'Unknown User'}
                        </h4>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {conversation.last_message_at
                            ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })
                            : ''}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs capitalize mt-1">
                        {conversation.other_user?.role || 'User'}
                      </Badge>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-muted-foreground truncate font-poppins">
                          {conversation.last_message || 'No messages yet'}
                        </p>
                        {conversation.unread_count > 0 && (
                          <Badge className="bg-primary text-primary-foreground text-xs shrink-0 ml-2">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Chat Area */}
      {showChat && (
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b bg-background flex items-center gap-3">
                {isMobile && (
                  <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {selectedConversation.other_user?.business_name?.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium font-poppins">
                    {selectedConversation.other_user?.business_name || selectedConversation.other_user?.email}
                  </h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedConversation.other_user?.role}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p className="font-poppins">Start a conversation...</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine = message.sender_id === user?.id;
                    return (
                      <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2 rounded-lg ${
                          isMine ? 'bg-primary text-primary-foreground' : 'bg-background shadow-sm border'
                        }`}>
                          <p className="text-sm font-poppins whitespace-pre-wrap">{message.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${
                            isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            <span className="text-xs">
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            </span>
                            {isMine && (
                              message.read_at
                                ? <CheckCheck className="h-3 w-3" />
                                : <Check className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t bg-background">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    className="flex-1"
                    disabled={sendingMessage}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2 font-poppins">Select a conversation</h3>
                <p className="text-muted-foreground font-poppins">Choose a conversation from the sidebar to start messaging.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedMessaging;
