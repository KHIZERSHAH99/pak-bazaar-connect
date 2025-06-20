
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ChatSupport from '@/components/dashboard/ChatSupport';

const DashboardChat: React.FC = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ChatSupport />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardChat;
