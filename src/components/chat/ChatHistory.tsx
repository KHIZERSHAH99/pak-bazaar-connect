
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
      <div className="flex flex-col justify-center items-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pakistani-green-600 mb-4"></div>
        <p className="text-pakistani-green-700 animate-pulse">Loading your conversation...</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100%-2rem)] pr-4">
      <ChatWelcomeMessage />
      
      {chatHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-500 animate-fadeIn">
          <MessageSquare className="h-16 w-16 mb-4 text-gray-300" />
          <p className="text-center">No messages yet. Ask anything about using the platform!</p>
          <div className="mt-4 flex space-x-2">
            <div className="typing-dot"></div>
            <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
            <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
          </div>
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
