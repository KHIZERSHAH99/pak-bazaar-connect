
import { supabase } from '@/integrations/supabase/client';
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

export const createConversation = async (data: {
  buyer_id: string;
  seller_id: string;
  product_id?: string;
}): Promise<Conversation> => {
  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }

  return conversation;
};

export const getUserConversations = async (): Promise<Conversation[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      products (name),
      buyer:profiles!buyer_id (email),
      seller:profiles!seller_id (email)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return data as Conversation[];
};

export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data as Message[];
};

export const createMessage = async (data: {
  conversation_id: string;
  sender_id: string;
  content: string;
  attachment?: string;
}): Promise<Message> => {
  const { data: message, error } = await supabase
    .from('messages')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error creating message:', error);
    throw error;
  }

  // Update conversation last message
  await supabase
    .from('conversations')
    .update({
      last_message: data.content,
      last_message_at: new Date().toISOString()
    })
    .eq('id', data.conversation_id);

  return message;
};
