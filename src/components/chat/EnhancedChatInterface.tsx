
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Send, Bot, User, Sparkles, MessageCircle, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

interface ChatMessage {
  id: string;
  message: string;
  reply: string;
  created_at: string;
  isUser: boolean;
}

const quickQuestions = [
  "How to create an ad?",
  "How to place an order?",
  "What are the payment methods?",
  "How to verify my business?",
  "What is the commission structure?",
  "How to contact a wholesaler?",
];

export const EnhancedChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatHistory();
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      message: '',
      reply: "👋 Welcome to Pakistan B2B Support! I'm here to help you with:\n\n• Creating and managing ads\n• Placing orders\n• Payment processes\n• Business verification\n• Platform navigation\n\nHow can I assist you today?",
      created_at: new Date().toISOString(),
      isUser: false
    };
    setMessages([welcomeMessage]);
  }, []);

  const loadChatHistory = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      
      if (data) {
        setChatHistory(data);
        const historyMessages: ChatMessage[] = data.flatMap(chat => [
          {
            id: `${chat.id}-user`,
            message: chat.message,
            reply: '',
            created_at: chat.created_at,
            isUser: true
          },
          {
            id: `${chat.id}-bot`,
            message: '',
            reply: chat.reply,
            created_at: chat.created_at,
            isUser: false
          }
        ]);
        setMessages(prev => [...prev, ...historyMessages]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatMessage = async (userMessage: string, botReply: string) => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { error } = await supabase
        .from('chat_history')
        .insert({
          user_id: user.id,
          message: userMessage,
          reply: botReply
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  const generateAIResponse = async (message: string): Promise<string> => {
    try {
      // Call the chatbot edge function
      const { data, error } = await supabase.functions.invoke('chatbot', {
        body: { 
          message,
          context: 'Pakistani B2B marketplace platform support'
        }
      });

      if (error) throw error;
      return data?.reply || "I apologize, but I'm having trouble processing your request right now. Please try again or contact support.";
    } catch (error) {
      console.error('Chatbot error:', error);
      
      // Fallback responses for common questions
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('ad') || lowerMessage.includes('advertisement')) {
        return "To create an ad:\n1. Go to Dashboard → Ads\n2. Click 'Create New Ad'\n3. Add headline and image\n4. Submit for approval\n\nAds are reviewed within 24 hours. First 10 wholesalers get free ads!";
      }
      
      if (lowerMessage.includes('order') || lowerMessage.includes('buy')) {
        return "To place an order:\n1. Browse shops or products\n2. Select quantity (minimum order quantity applies)\n3. Choose payment method\n4. Upload payment screenshot\n5. Wait for wholesaler confirmation\n\nYour contact details are only revealed after confirmation.";
      }
      
      if (lowerMessage.includes('payment')) {
        return "Available payment methods:\n• Bank Transfer\n• JazzCash\n• EasyPaisa\n• Cash on Delivery (COD)\n\nAlways upload payment screenshots for faster order processing.";
      }
      
      if (lowerMessage.includes('verify') || lowerMessage.includes('verification')) {
        return "Business verification:\n1. Complete your profile\n2. Upload required documents\n3. Wait for admin approval\n\nVerified businesses get priority listing and increased trust.";
      }
      
      return "I'm here to help! You can ask me about:\n• Creating ads\n• Placing orders\n• Payment methods\n• Business verification\n• Commission structure\n• Platform features";
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || inputMessage.trim();
    if (!message) return;

    setIsLoading(true);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      message,
      reply: '',
      created_at: new Date().toISOString(),
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      // Generate AI response
      const aiReply = await generateAIResponse(message);
      
      // Add AI response
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        message: '',
        reply: aiReply,
        created_at: new Date().toISOString(),
        isUser: false
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Save to database
      await saveChatMessage(message, aiReply);
      
    } catch (error: any) {
      toast({
        title: "Chat Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-pakistani_green-600" />
          B2B Support Assistant
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Quick Questions */}
        <div className="p-4 border-b bg-gray-50">
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Quick Questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSendMessage(question)}
                disabled={isLoading}
                className="text-xs"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!msg.isUser && (
                  <div className="w-8 h-8 rounded-full bg-pakistani_green-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-pakistani_green-600" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.isUser
                      ? 'bg-pakistani_green-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {msg.isUser ? msg.message : msg.reply}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </div>
                </div>

                {msg.isUser && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-pakistani_green-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-pakistani_green-600" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about the platform..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
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
