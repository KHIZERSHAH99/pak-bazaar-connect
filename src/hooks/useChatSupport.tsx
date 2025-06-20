
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { saveChat, getChatHistory } from '@/lib/chat';
import { useToast } from '@/hooks/use-toast';
import type { ChatMessage } from '@/lib/types';

export const useChatSupport = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const history = await getChatHistory();
      // Sort messages by creation time (oldest first)
      const sortedHistory = history.sort((a, b) => 
        new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
      );
      setChatHistory(sortedHistory);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat history. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    try {
      setSending(true);
      
      // Get the current user ID to include in headers
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      console.log("Calling chatbot edge function...");
      
      // Add the message to the UI immediately for better UX
      const tempMessage = {
        id: `temp-${Date.now()}`,
        user_id: userId || '',
        message,
        reply: '',
        created_at: new Date().toISOString()
      };
      
      setChatHistory(prev => [...prev, tempMessage]);
      
      // Call OpenAI API through our Edge Function
      const response = await supabase.functions.invoke('chatbot', {
        body: { message },
        headers: userId ? { 'x-user-id': userId } : undefined,
      });
      
      console.log("Response received:", response);
      
      if (!response.data) {
        throw new Error('Failed to get response from chatbot');
      }
      
      const botReply = response.data.reply || "I'm sorry, I couldn't process your request at the moment.";
      
      // Save chat to database
      await saveChat(message, botReply);
      
      // Update chat history with the actual response
      setChatHistory(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? {
                id: Date.now().toString(),
                user_id: userId || '',
                message,
                reply: botReply,
                created_at: new Date().toISOString()
              }
            : msg
        )
      );
      
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Message Failed',
        description: error.message || 'Failed to send your message. Please try again.',
        variant: 'destructive',
      });
      
      // Remove the temporary message if there was an error
      setChatHistory(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
    } finally {
      setSending(false);
    }
  };

  return {
    chatHistory,
    loading,
    sending,
    sendMessage,
    refreshHistory: fetchChatHistory
  };
};
