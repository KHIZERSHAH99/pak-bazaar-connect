
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
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Chat Support</h1>
        
        <Card className="overflow-hidden h-[calc(100vh-12rem)]">
          <div className="bg-pakistani-green-700 text-white px-6 py-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            <h2 className="font-semibold">AI Support Assistant</h2>
          </div>
          
          <div className="h-[calc(100%-4rem)] flex flex-col">
            <div className="flex-grow overflow-y-auto p-6">
              <ChatHistory 
                chatHistory={chatHistory} 
                loading={loading} 
              />
            </div>
            
            <div className="border-t p-4">
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
