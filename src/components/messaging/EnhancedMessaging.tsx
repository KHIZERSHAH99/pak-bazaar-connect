import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare, Send, Search, Loader2, ArrowLeft, Check, CheckCheck,
  Smile, Paperclip, MoreVertical, Phone, Circle
} from 'lucide-react';
import NewConversationDialog from './NewConversationDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

const QUICK_EMOJIS = ['👍', '❤️', '😊', '🙏', '✅', '📦'];

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, 'h:mm a');
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

function formatConversationTime(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

function getInitials(name?: string, email?: string): string {
  if (name) return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return email?.[0]?.toUpperCase() || '?';
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
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectedConvRef = useRef<ConversationData | null>(null);

  // Keep ref in sync for realtime callback
  useEffect(() => {
    selectedConvRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    if (!user) return;
    fetchConversations();

    const channel = supabase
      .channel('messages-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as MessageData;
        const currentConv = selectedConvRef.current;
        if (currentConv && newMsg.conversation_id === currentConv.id) {
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Auto-mark as read
          if (newMsg.sender_id !== user.id) {
            supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', newMsg.id);
          }
        }
        fetchConversations();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        const updatedMsg = payload.new as MessageData;
        setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

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

      const otherUserIds = [...new Set(convos.map(c => c.buyer_id === user.id ? c.seller_id : c.buyer_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, business_name, role')
        .in('id', otherUserIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      const convIds = convos.map(c => c.id);
      const { data: unreadData } = await supabase
        .from('messages')
        .select('conversation_id')
        .in('conversation_id', convIds)
        .neq('sender_id', user.id)
        .is('read_at', null);

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

      // Sort: unread first, then by time
      result.sort((a, b) => {
        if (a.unread_count > 0 && b.unread_count === 0) return -1;
        if (a.unread_count === 0 && b.unread_count > 0) return 1;
        return new Date(b.last_message_at || b.created_at).getTime() - new Date(a.last_message_at || a.created_at).getTime();
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

      if (user) {
        const { data: updatedRows, error: readError } = await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id)
          .is('read_at', null)
          .select('id');

        if (readError) {
          console.error('Failed to mark messages as read:', readError);
        } else if (updatedRows?.length) {
          // Refresh conversation list so the unread badge clears immediately
          setConversations(prev =>
            prev.map(c => (c.id === conversationId ? { ...c, unread_count: 0 } : c))
          );
          fetchConversations();
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (content?: string) => {
    const msg = (content || newMessage).trim();
    if (!msg || !selectedConversation || !user) return;
    setSendingMessage(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          content: msg
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('conversations')
        .update({
          last_message: msg,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedConversation.id);

      setMessages(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data]);
      setNewMessage('');
      setShowEmojiBar(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      fetchConversations();
    } catch (error: any) {
      toast({ title: 'Failed to send message', description: error.message, variant: 'destructive' });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleNewConversation = useCallback(async (conversationId: string) => {
    await fetchConversations();
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    if (data && user) {
      const otherId = data.buyer_id === user.id ? data.seller_id : data.buyer_id;
      const { data: prof } = await supabase
        .from('profiles')
        .select('id, email, business_name, role')
        .eq('id', otherId)
        .maybeSingle();
      setSelectedConversation({ ...data, other_user: prof || undefined, unread_count: 0 });
    }
  }, [user]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const filteredConversations = conversations.filter(conv =>
    !searchTerm ||
    conv.other_user?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.other_user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showList = !isMobile || !selectedConversation;
  const showChat = !isMobile || !!selectedConversation;

  // Group messages by date
  const groupedMessages: { date: string; messages: MessageData[] }[] = [];
  messages.forEach((msg) => {
    const dateKey = format(new Date(msg.created_at), 'yyyy-MM-dd');
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateKey) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateKey, messages: [msg] });
    }
  });

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] min-h-[400px] items-center justify-center border rounded-xl bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground font-poppins">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[400px] border rounded-xl overflow-hidden bg-background shadow-sm">
      {/* Conversations List */}
      {showList && (
        <div className={`${isMobile ? 'w-full' : 'w-[340px]'} border-r flex flex-col bg-background`}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg font-poppins text-foreground">Messages</h3>
                <p className="text-xs text-muted-foreground font-poppins">
                  {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                </p>
              </div>
              <NewConversationDialog onConversationCreated={handleNewConversation} />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="font-medium text-foreground mb-1 font-poppins">No conversations yet</h4>
                <p className="text-sm text-muted-foreground font-poppins mb-4">
                  Start messaging wholesalers or sellers to negotiate deals.
                </p>
                <NewConversationDialog onConversationCreated={handleNewConversation} />
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const isSelected = selectedConversation?.id === conversation.id;
                const hasUnread = conversation.unread_count > 0;
                return (
                  <div
                    key={conversation.id}
                    className={`px-3 py-3 cursor-pointer transition-all duration-150 border-b border-border/50 ${
                      isSelected
                        ? 'bg-primary/10'
                        : hasUnread
                          ? 'bg-primary/5 hover:bg-primary/10'
                          : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-11 w-11 shrink-0">
                          <AvatarFallback className={`text-xs font-medium ${hasUnread ? 'bg-primary/20 text-primary' : ''}`}>
                            {getInitials(conversation.other_user?.business_name, conversation.other_user?.email)}
                          </AvatarFallback>
                        </Avatar>
                        {/* Role indicator dot */}
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${
                          conversation.other_user?.role === 'wholesaler' ? 'bg-emerald-500' : 
                          conversation.other_user?.role === 'seller' ? 'bg-blue-500' : 'bg-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-poppins truncate ${hasUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>
                            {conversation.other_user?.business_name || conversation.other_user?.email || 'Unknown User'}
                          </h4>
                          <span className={`text-[11px] shrink-0 ml-2 ${hasUnread ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                            {formatConversationTime(conversation.last_message_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className={`text-[13px] truncate pr-2 ${hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            {conversation.last_message || 'No messages yet'}
                          </p>
                          {hasUnread && (
                            <Badge className="bg-primary text-primary-foreground text-[10px] h-5 min-w-[20px] flex items-center justify-center shrink-0 rounded-full">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Chat Area */}
      {showChat && (
        <div className="flex-1 flex flex-col min-w-0">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b bg-background flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {isMobile && (
                    <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)} className="shrink-0 -ml-2">
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  )}
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm font-medium">
                        {getInitials(selectedConversation.other_user?.business_name, selectedConversation.other_user?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                      selectedConversation.other_user?.role === 'wholesaler' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium font-poppins truncate text-foreground">
                      {selectedConversation.other_user?.business_name || selectedConversation.other_user?.email}
                    </h4>
                    <p className="text-xs text-muted-foreground capitalize font-poppins">
                      {selectedConversation.other_user?.role}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => fetchMessages(selectedConversation.id)}>
                      Refresh messages
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 py-3 bg-muted/20">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Send className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground font-poppins">Start the conversation</h4>
                        <p className="text-sm text-muted-foreground font-poppins mt-1">
                          Send a message to {selectedConversation.other_user?.business_name || 'this user'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  groupedMessages.map((group) => (
                    <div key={group.date}>
                      {/* Date Separator */}
                      <div className="flex items-center justify-center my-4">
                        <div className="bg-muted text-muted-foreground text-[11px] font-medium px-3 py-1 rounded-full font-poppins">
                          {formatDateSeparator(group.messages[0].created_at)}
                        </div>
                      </div>
                      {/* Messages */}
                      {group.messages.map((message, idx) => {
                        const isMine = message.sender_id === user?.id;
                        const prevMsg = group.messages[idx - 1];
                        const isConsecutive = prevMsg && prevMsg.sender_id === message.sender_id &&
                          new Date(message.created_at).getTime() - new Date(prevMsg.created_at).getTime() < 120000;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-0.5' : 'mt-3'}`}
                          >
                            <div className={`max-w-[75%] ${isMine ? 'order-1' : ''}`}>
                              <div className={`px-3.5 py-2 ${
                                isMine
                                  ? `bg-primary text-primary-foreground ${isConsecutive ? 'rounded-2xl rounded-tr-md' : 'rounded-2xl rounded-tr-md'}`
                                  : `bg-background border shadow-sm ${isConsecutive ? 'rounded-2xl rounded-tl-md' : 'rounded-2xl rounded-tl-md'}`
                              }`}>
                                <p className="text-sm font-poppins whitespace-pre-wrap break-words">{message.content}</p>
                              </div>
                              {/* Timestamp row - show for last in consecutive group or non-consecutive */}
                              {(!group.messages[idx + 1] || group.messages[idx + 1]?.sender_id !== message.sender_id) && (
                                <div className={`flex items-center gap-1 mt-1 px-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                  <span className="text-[11px] text-muted-foreground">
                                    {formatMessageTime(message.created_at)}
                                  </span>
                                  {isMine && (
                                    message.read_at
                                      ? <CheckCheck className="h-3 w-3 text-primary" />
                                      : <Check className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Emoji Bar */}
              {showEmojiBar && (
                <div className="px-4 py-2 border-t bg-background flex items-center gap-1 overflow-x-auto">
                  {QUICK_EMOJIS.map((emoji) => (
                    <TooltipProvider key={emoji}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => sendMessage(emoji)}
                            className="text-xl hover:scale-125 transition-transform p-1.5 rounded-lg hover:bg-muted"
                          >
                            {emoji}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Send {emoji}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              )}

              {/* Message Input */}
              <div className="p-3 border-t bg-background">
                <div className="flex items-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-9 w-9"
                    onClick={() => setShowEmojiBar(!showEmojiBar)}
                  >
                    <Smile className={`h-5 w-5 ${showEmojiBar ? 'text-primary' : 'text-muted-foreground'}`} />
                  </Button>
                  <Textarea
                    ref={textareaRef}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-h-[40px] max-h-[120px] resize-none bg-muted/50 border-0 focus-visible:ring-1 py-2.5"
                    rows={1}
                    disabled={sendingMessage}
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!newMessage.trim() || sendingMessage}
                    size="icon"
                    className="shrink-0 h-9 w-9 rounded-full bg-primary hover:bg-primary/90"
                  >
                    {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 px-1 font-poppins">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/10">
              <div className="text-center space-y-4 px-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground font-poppins">Your Messages</h3>
                  <p className="text-muted-foreground font-poppins mt-2 max-w-sm mx-auto">
                    Select a conversation from the sidebar or start a new one to begin messaging.
                  </p>
                </div>
                <NewConversationDialog onConversationCreated={handleNewConversation} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedMessaging;
