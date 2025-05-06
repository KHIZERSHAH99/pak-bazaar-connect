
import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { saveChat, getChatHistory } from '@/lib/chat';
import { useToast } from '@/hooks/use-toast';
import { Send, MessageSquare, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { ChatMessage } from '@/lib/types';

const ChatSupport: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const history = await getChatHistory();
      setChatHistory(history);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    try {
      setSending(true);
      
      // Get the current user ID to include in headers
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      // Call OpenAI API through our Edge Function
      const response = await supabase.functions.invoke('chatbot', {
        body: { message },
        headers: userId ? { 'x-user-id': userId } : undefined,
      });
      
      if (!response.data) {
        throw new Error('Failed to get response from chatbot');
      }
      
      const botReply = response.data.reply || "I'm sorry, I couldn't process your request at the moment.";
      
      // Save chat to database
      await saveChat(message, botReply);
      
      // Update chat history
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        user_id: userId || '',
        message,
        reply: botReply,
        created_at: new Date().toISOString()
      }]);
      
      setMessage('');
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

  const formatTimestamp = (timestamp: string | undefined) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Chat Support</h1>
        
        <Card className="overflow-hidden">
          <div className="bg-pakistani-green-900 text-white px-6 py-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            <h2 className="font-semibold">AI Support Assistant</h2>
          </div>
          
          <div className="h-[500px] flex flex-col">
            <div className="flex-grow overflow-y-auto p-6">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageSquare className="h-12 w-12 mb-2" />
                  <p>No messages yet. Ask anything about using the platform!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-pakistani-green-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="bg-pakistani-green-200 rounded-full p-2 mr-3">
                        <MessageSquare className="h-5 w-5 text-pakistani-green-700" />
                      </div>
                      <div>
                        <div className="font-medium text-pakistani-green-800">AI Support</div>
                        <div className="text-gray-700 mt-1">
                          Hello! I'm your AI assistant. How can I help you today? You can ask me about:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>How to create a shop</li>
                            <li>How to list products</li>
                            <li>How to create ads</li>
                            <li>How to switch roles</li>
                            <li>Any other platform-related questions</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {chatHistory.map((chat) => (
                    <div key={chat.id} className="space-y-4">
                      <div className="flex flex-col items-end">
                        <div className="bg-blue-100 rounded-lg p-4 max-w-[80%]">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-blue-800">You</div>
                            <div className="text-xs text-gray-500 ml-2">
                              {formatTimestamp(chat.created_at)}
                            </div>
                          </div>
                          <p className="text-gray-700">{chat.message}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-start">
                        <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-gray-800">AI Support</div>
                            <div className="text-xs text-gray-500 ml-2">
                              {formatTimestamp(chat.created_at)}
                            </div>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{chat.reply}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Textarea
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-grow"
                  disabled={sending}
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (message.trim() && !sending) {
                        handleSendMessage(e);
                      }
                    }
                  }}
                />
                <Button 
                  type="submit"
                  className="bg-primary hover:bg-pakistani-green-800 self-end"
                  disabled={!message.trim() || sending}
                >
                  {sending ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

const ChatSupportWithAuth = () => (
  <ProtectedRoute>
    <ChatSupport />
  </ProtectedRoute>
);

export default ChatSupportWithAuth;
