
// Re-export the database-backed messaging functions
export { 
  createConversation, 
  getUserConversations, 
  getConversationMessages, 
  createMessage,
  markMessageAsRead 
} from '@/lib/messaging-db';

export type { Conversation, Message } from '@/lib/messaging-db';
