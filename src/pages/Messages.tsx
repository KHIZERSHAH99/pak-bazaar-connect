import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import EnhancedMessaging from '@/components/messaging/EnhancedMessaging';

const Messages: React.FC = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-poppins">Messages</h1>
            <p className="text-muted-foreground font-poppins">
              Communicate with suppliers and customers
            </p>
          </div>
          <EnhancedMessaging />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Messages;
