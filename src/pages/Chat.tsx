
import React from 'react';
import { useAuth } from '@/contexts/AuthContextFixed';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ModernChatInterface from '@/components/chat/ModernChatInterface';

const Chat: React.FC = () => {
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-poppins">Support Chat</h1>
            <p className="text-muted-foreground font-poppins">
              Get instant help with our AI-powered support assistant
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <ModernChatInterface className="w-full max-w-4xl" />
        </div>
      </div>
    </DashboardLayout>
  );
};

const ChatWithAuth = () => (
  <ProtectedRoute>
    <Chat />
  </ProtectedRoute>
);

export default ChatWithAuth;
