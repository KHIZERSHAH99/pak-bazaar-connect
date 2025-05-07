
import React, { useRef, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from './ChatMessage';
import ChatWelcomeMessage from './ChatWelcomeMessage';
import type { ChatMessage as ChatMessageType } from '@/lib/types';

interface ChatHistoryProps {
  chatHistory: ChatMessageType[];
  loading: boolean;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ chatHistory, loading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pakistani-green-600"></div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100%-2rem)] pr-4">
      <ChatWelcomeMessage />
      
      {chatHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-gray-500">
          <MessageSquare className="h-12 w-12 mb-2" />
          <p>No messages yet. Ask anything about using the platform!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {chatHistory.map((chat) => (
            <ChatMessage key={chat.id} message={chat} />
          ))}
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </ScrollArea>
  );
};

export default ChatHistory;
