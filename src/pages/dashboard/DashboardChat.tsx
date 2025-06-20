
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import UnifiedChatSupport from '@/components/chat/UnifiedChatSupport';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

const DashboardChat: React.FC = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <Breadcrumbs items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Support Chat' }
          ]} />
          <UnifiedChatSupport />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardChat;
