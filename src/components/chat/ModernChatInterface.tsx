
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  MessageSquare, 
  Bot, 
  User, 
  X, 
  Minimize2, 
  Maximize2,
  HelpCircle,
  Clock
} from 'lucide-react';
import { useChatSupport } from '@/hooks/useChatSupport';
import { cn } from '@/lib/utils';

interface ModernChatInterfaceProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const ModernChatInterface: React.FC<ModernChatInterfaceProps> = ({ 
  isOpen = true, 
  onClose,
  className 
}) => {
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { chatHistory, loading, sending, sendMessage } = useChatSupport();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    
    const messageToSend = message;
    setMessage('');
    setIsTyping(true);
    
    try {
      await sendMessage(messageToSend);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "How do I create an ad?",
    "How to register as wholesaler?",
    "How does order processing work?",
    "What are the payment options?",
    "How to verify my business?"
  ];

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <Card className={cn(
      "w-full max-w-2xl mx-auto shadow-lg border-0",
      isMinimized && "h-16",
      className
    )}>
      <CardHeader className="border-b bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.png" />
                <AvatarFallback className="bg-white text-pakistani_green-700">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <CardTitle className="text-sm font-medium font-poppins">
                Pak Bazaar Support
              </CardTitle>
              <p className="text-xs text-green-100 font-poppins">
                AI Assistant • Online
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            {onClose && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 h-96 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pakistani_green-600"></div>
                <span className="ml-2 text-sm text-muted-foreground font-poppins">Loading chat history...</span>
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium text-foreground mb-2 font-poppins">
                    Welcome to Pak Bazaar Support!
                  </h3>
                  <p className="text-sm text-muted-foreground font-poppins">
                    Ask me anything about our B2B marketplace platform.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground font-poppins mb-2">
                    Quick Questions:
                  </p>
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(question)}
                      className="block w-full text-left p-2 text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors font-poppins"
                    >
                      <HelpCircle className="h-3 w-3 inline mr-2 text-pakistani_green-600" />
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {chatHistory.map((chat) => (
                  <div key={chat.id} className="space-y-3">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="flex items-start space-x-2 max-w-[80%]">
                        <div className="bg-pakistani_green-600 text-white rounded-lg px-3 py-2">
                          <p className="text-sm font-poppins">{chat.message}</p>
                          <div className="flex items-center justify-end mt-1 space-x-1">
                            <Clock className="h-3 w-3 opacity-70" />
                            <span className="text-xs opacity-70">
                              {formatTime(chat.created_at || '')}
                            </span>
                          </div>
                        </div>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-pakistani_green-100 text-pakistani_green-700 text-xs">
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>

                    {/* Bot Reply */}
                    {chat.reply && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-2 max-w-[80%]">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                              <Bot className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-white dark:bg-gray-800 border rounded-lg px-3 py-2 shadow-sm">
                            <div className="flex items-center mb-1">
                              <span className="text-xs font-medium text-blue-600 font-poppins">
                                Support Assistant
                              </span>
                              <Badge variant="secondary" className="ml-2 text-xs">AI</Badge>
                            </div>
                            <p className="text-sm text-foreground font-poppins whitespace-pre-wrap">
                              {chat.reply}
                            </p>
                            <div className="flex items-center mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground ml-1">
                                {formatTime(chat.created_at || '')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {(sending || isTyping) && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                          <Bot className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-white dark:bg-gray-800 border rounded-lg px-3 py-2 shadow-sm">
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-muted-foreground font-poppins ml-2">Typing...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={sending}
                className="flex-1 bg-white dark:bg-gray-800 font-poppins"
              />
              <Button 
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className="bg-pakistani_green-600 hover:bg-pakistani_green-700 px-3"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-poppins">
              Press Enter to send • Our AI assistant is here to help 24/7
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ModernChatInterface;
