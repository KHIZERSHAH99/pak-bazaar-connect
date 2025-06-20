
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
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      console.log("Calling chatbot edge function...");
      
      // Add the message to the UI immediately for better UX
      const tempMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        user_id: userId,
        message,
        reply: '',
        created_at: new Date().toISOString()
      };
      
      setChatHistory(prev => [...prev, tempMessage]);
      
      // Call OpenAI API through our Edge Function
      const response = await supabase.functions.invoke('chatbot', {
        body: { message },
        headers: { 'x-user-id': userId },
      });
      
      console.log("Response received:", response);
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to get response from chatbot');
      }
      
      const botReply = response.data?.reply || "I'm sorry, I couldn't process your request at the moment. Please try again.";
      
      // Save chat to database
      try {
        await saveChat(message, botReply);
      } catch (dbError) {
        console.warn('Failed to save chat to database, but continuing with response:', dbError);
      }
      
      // Update chat history with the actual response
      setChatHistory(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? {
                id: Date.now().toString(),
                user_id: userId,
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
