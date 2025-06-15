
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import ChatHistory from '@/components/chat/ChatHistory';
import ChatInput from '@/components/chat/ChatInput';
import { useChatSupport } from '@/hooks/useChatSupport';

const ChatSupport: React.FC = () => {
  const { chatHistory, loading, sending, sendMessage } = useChatSupport();

  return (
    <DashboardLayout>
      <div className="relative">
        {/* Animated background remains */}
        <div className="animated-background dark:!bg-pakistani_green-950/95 !bg-pakistani_green-50/90" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-pakistani_green-100 mb-6 relative z-10">AI Chat Support</h1>
        {/* Card: translucent green with black inner for chat */}
        <Card className="overflow-hidden h-[calc(100vh-12rem)] shadow-xl border-gray-100 relative z-10 bg-translucent-green dark:bg-translucent-green backdrop-blur-lg">
          <div className="bg-gradient-to-r from-pakistani_green-900/80 to-pakistani_green-800/80 text-white px-6 py-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            <h2 className="font-semibold">AI Support Assistant</h2>
            <div className="ml-auto flex space-x-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-xs text-green-100">Online</span>
            </div>
          </div>
          <div className="h-[calc(100%-4rem)] flex flex-col">
            <div className="flex-grow overflow-y-auto p-6 chat-green-bg">
              <ChatHistory 
                chatHistory={chatHistory} 
                loading={loading} 
              />
            </div>
            <div className="border-t p-4 bg-black/70 dark:bg-black/85">
              <ChatInput 
                onSendMessage={sendMessage} 
                isSending={sending} 
              />
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
