
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
        <div className="animated-background"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6 relative z-10">AI Chat Support</h1>
        
        <Card className="overflow-hidden h-[calc(100vh-12rem)] shadow-xl border-gray-100 relative z-10 bg-white bg-opacity-95 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-pakistani-green-600 to-pakistani-green-800 text-white px-6 py-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            <h2 className="font-semibold">AI Support Assistant</h2>
            <div className="ml-auto flex space-x-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-xs text-green-100">Online</span>
            </div>
          </div>
          
          <div className="h-[calc(100%-4rem)] flex flex-col">
            <div className="flex-grow overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
              <ChatHistory 
                chatHistory={chatHistory} 
                loading={loading} 
              />
            </div>
            
            <div className="border-t p-4 bg-gray-50">
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
