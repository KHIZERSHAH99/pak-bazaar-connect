
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

const Messages: React.FC = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">Messages</h1>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-poppins">
                <MessageSquare className="w-5 h-5" />
                Your Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 font-poppins">
                Communicate with other users, suppliers, and customers directly through our messaging system.
              </p>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 font-poppins text-sm">
                  💬 No messages yet. Start connecting with other users to begin conversations!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Messages;
