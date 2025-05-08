
import React from 'react';
import { User, MessageSquare } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

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
      <div className="flex flex-col items-end animate-slideIn">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl rounded-tr-sm p-4 max-w-[80%] shadow-md">
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium">You</div>
            <div className="text-xs text-blue-100 ml-2">
              {formatTimestamp(message.created_at)}
            </div>
          </div>
          <p>{message.message}</p>
        </div>
      </div>
      
      {/* AI response */}
      <div className="flex flex-col items-start animate-slideIn" style={{ animationDelay: '0.2s' }}>
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl rounded-tl-sm p-4 max-w-[80%] shadow-md">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <div className="bg-pakistani_green-200 rounded-full p-1 mr-1">
                <MessageSquare className="h-3 w-3 text-pakistani_green-700" />
              </div>
              <div className="font-medium text-gray-800">AI Support</div>
            </div>
            <div className="text-xs text-gray-500 ml-2">
              {formatTimestamp(message.created_at)}
            </div>
          </div>
          <div className="text-gray-700 whitespace-pre-wrap">{message.reply}</div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
