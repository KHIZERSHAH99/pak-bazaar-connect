
import React from 'react';
import { MessageSquare } from 'lucide-react';

const ChatWelcomeMessage: React.FC = () => {
  return (
    <div className="bg-pakistani-green-50 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="bg-pakistani-green-200 rounded-full p-2 mr-3">
          <MessageSquare className="h-5 w-5 text-pakistani-green-700" />
        </div>
        <div>
          <div className="font-medium text-pakistani-green-800">AI Support</div>
          <div className="text-gray-700 mt-1">
            Hello! I'm your AI assistant for Pak Bazaar Connect. How can I help you today? You can ask me about:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>How to create a shop</li>
              <li>How to list products</li>
              <li>How to create ads</li>
              <li>How to switch roles</li>
              <li>Any other platform-related questions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWelcomeMessage;
