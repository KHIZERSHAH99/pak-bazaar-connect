
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
      setChatHistory(history);
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
      
      console.log("Saving chat to database...");
      
      // Save chat to database
      await saveChat(message, botReply);
      
      console.log("Updating chat history...");
      
      // Update chat history
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        user_id: userId || '',
        message,
        reply: botReply,
        created_at: new Date().toISOString()
      }]);
      
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Message Failed',
        description: error.message || 'Failed to send your message. Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return {
    chatHistory,
    loading,
    sending,
    sendMessage
  };
};
