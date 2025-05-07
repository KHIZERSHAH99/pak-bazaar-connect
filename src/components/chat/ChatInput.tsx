
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isSending: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isSending }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;
    
    try {
      await onSendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2 bg-white rounded-lg shadow-md p-3 border border-gray-100">
      <Textarea
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-grow resize-none bg-gray-50 border-gray-200 focus:border-pakistani-green-300 focus:ring focus:ring-pakistani-green-200 focus:ring-opacity-50 rounded-md transition-all"
        disabled={isSending}
        rows={2}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (message.trim() && !isSending) {
              handleSubmit(e);
            }
          }
        }}
      />
      <Button 
        type="submit"
        className="bg-pakistani-green-700 hover:bg-pakistani-green-800 self-end transition-all duration-200 hover:scale-105"
        disabled={!message.trim() || isSending}
      >
        {isSending ? (
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
};

export default ChatInput;
