
import React from 'react';
import { User, MessageSquare } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/lib/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const formatTimestamp = (timestamp: string | undefined) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className="space-y-4">
      {/* User message */}
      <div className="flex flex-col items-end">
        <div className="bg-blue-100 rounded-lg p-4 max-w-[80%]">
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium text-blue-800">You</div>
            <div className="text-xs text-gray-500 ml-2">
              {formatTimestamp(message.created_at)}
            </div>
          </div>
          <p className="text-gray-700">{message.message}</p>
        </div>
      </div>
      
      {/* AI response */}
      <div className="flex flex-col items-start">
        <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium text-gray-800">AI Support</div>
            <div className="text-xs text-gray-500 ml-2">
              {formatTimestamp(message.created_at)}
            </div>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{message.reply}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
