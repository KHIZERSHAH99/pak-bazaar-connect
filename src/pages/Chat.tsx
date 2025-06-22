
import React from 'react';
import { EnhancedChatInterface } from '@/components/chat/EnhancedChatInterface';

const Chat = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <EnhancedChatInterface />
      </div>
    </div>
  );
};

export default Chat;
