
import { getCurrentUser } from '@/lib/auth';

export interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id?: string;
  created_at: string;
  last_message?: string;
  last_message_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachment?: string;
  created_at: string;
}

// Mock storage for conversations and messages since the tables don't exist yet
let mockConversations: Conversation[] = [];
let mockMessages: Message[] = [];

export const createConversation = async (data: {
  buyer_id: string;
  seller_id: string;
  product_id?: string;
}): Promise<Conversation> => {
  // Check if conversation already exists
  const existingConversation = mockConversations.find(
    conv => conv.buyer_id === data.buyer_id && conv.seller_id === data.seller_id
  );
  
  if (existingConversation) {
    return existingConversation;
  }

  const conversation: Conversation = {
    id: `conv_${Date.now()}`,
    buyer_id: data.buyer_id,
    seller_id: data.seller_id,
    product_id: data.product_id,
    created_at: new Date().toISOString()
  };

  mockConversations.push(conversation);
  
  // Store in localStorage for persistence
  localStorage.setItem('conversations', JSON.stringify(mockConversations));
  
  return conversation;
};

export const getUserConversations = async (): Promise<Conversation[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  // Load from localStorage if empty
  if (mockConversations.length === 0) {
    const stored = localStorage.getItem('conversations');
    if (stored) {
      mockConversations = JSON.parse(stored);
    }
  }

  return mockConversations.filter(
    conv => conv.buyer_id === user.id || conv.seller_id === user.id
  );
};

export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  // Load from localStorage if empty
  if (mockMessages.length === 0) {
    const stored = localStorage.getItem('messages');
    if (stored) {
      mockMessages = JSON.parse(stored);
    }
  }

  return mockMessages.filter(msg => msg.conversation_id === conversationId);
};

export const createMessage = async (data: {
  conversation_id: string;
  sender_id: string;
  content: string;
  attachment?: string;
}): Promise<Message> => {
  const message: Message = {
    id: `msg_${Date.now()}`,
    conversation_id: data.conversation_id,
    sender_id: data.sender_id,
    content: data.content,
    attachment: data.attachment,
    created_at: new Date().toISOString()
  };

  mockMessages.push(message);
  
  // Update conversation last message
  const conversationIndex = mockConversations.findIndex(
    conv => conv.id === data.conversation_id
  );
  
  if (conversationIndex !== -1) {
    mockConversations[conversationIndex].last_message = data.content;
    mockConversations[conversationIndex].last_message_at = new Date().toISOString();
  }
  
  // Store in localStorage for persistence
  localStorage.setItem('messages', JSON.stringify(mockMessages));
  localStorage.setItem('conversations', JSON.stringify(mockConversations));

  return message;
};
