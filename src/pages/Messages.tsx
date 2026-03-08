import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import EnhancedMessaging from '@/components/messaging/EnhancedMessaging';
import { Helmet } from 'react-helmet-async';

const Messages: React.FC = () => {
  return (
    <ProtectedRoute>
      <Helmet>
        <title>Messages - Pak Bazaar Connect</title>
      </Helmet>
      <DashboardLayout>
        <EnhancedMessaging />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Messages;
