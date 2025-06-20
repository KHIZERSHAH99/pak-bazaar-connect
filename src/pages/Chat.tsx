
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import UnifiedChatSupport from '@/components/chat/UnifiedChatSupport';

const Chat: React.FC = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <UnifiedChatSupport />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Chat;
