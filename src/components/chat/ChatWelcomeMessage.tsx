
import React from 'react';
import { MessageSquare } from 'lucide-react';

const ChatWelcomeMessage: React.FC = () => {
  return (
    <div className="rounded-lg p-6 mb-6 border border-pakistani_green-300 shadow-sm relative overflow-hidden bg-black">
      <div className="relative z-10 flex items-start">
        <div className="bg-pakistani_green-800 dark:bg-pakistani_green-600 rounded-full p-3 mr-4 shadow-md">
          <MessageSquare className="h-6 w-6 text-pakistani_green-100 dark:text-white" />
        </div>
        <div>
          <div className="font-medium text-pakistani_green-100 dark:text-pakistani_green-100 text-lg mb-2">AI Support</div>
          <div className="text-gray-100 dark:text-gray-100">
            Hello! I'm your AI assistant for Pak Bazaar Connect. How can I help you today? You can ask me about:
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>How to create a shop</li>
              <li className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>How to list products</li>
              <li className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>How to create ads</li>
              <li className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>How to switch roles</li>
              <li className="animate-fadeIn" style={{ animationDelay: '0.5s' }}>Any other platform-related questions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWelcomeMessage;
