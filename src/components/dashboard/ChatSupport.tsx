
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

const ChatSupport: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 font-poppins">Chat Support</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <MessageSquare className="w-5 h-5" />
            Customer Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 font-poppins">
            Get help with your account, orders, or any questions about using Pak Bazaar Connect.
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 font-poppins text-sm">
              💬 Our AI assistant is here to help you 24/7. Ask questions about creating ads, managing products, or platform features.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatSupport;
