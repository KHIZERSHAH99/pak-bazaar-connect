
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
    
    await onSendMessage(message);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <Textarea
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-grow"
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
        className="bg-primary hover:bg-pakistani-green-800 self-end"
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
