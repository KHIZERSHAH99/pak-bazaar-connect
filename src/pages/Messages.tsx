
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConversationList from '@/components/messaging/ConversationList';
import MessageThread from '@/components/messaging/MessageThread';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare } from 'lucide-react';

const Messages: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-poppins">Messages</h1>
              <p className="text-muted-foreground font-poppins">
                Communicate with suppliers and customers
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <ConversationList 
                onSelectConversation={setSelectedConversationId}
                selectedConversationId={selectedConversationId}
              />
            </div>

            {/* Chat Area */}
            <Card className="lg:col-span-2 flex flex-col">
              {selectedConversationId ? (
                <MessageThread conversationId={selectedConversationId} />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold font-poppins">Select a conversation</h3>
                      <p className="text-muted-foreground font-poppins">
                        Choose a conversation to start messaging
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Messages;
