import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

export interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id?: string;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachment?: string;
  read_at?: string;
  created_at: string;
}

export const createConversation = async (data: {
  buyer_id: string;
  seller_id: string;
  product_id?: string;
}): Promise<Conversation> => {
  // Check if conversation already exists
  const { data: existing, error: searchError } = await supabase
    .from('conversations')
    .select('*')
    .eq('buyer_id', data.buyer_id)
    .eq('seller_id', data.seller_id)
    .maybeSingle();

  if (searchError) {
    console.error('Error searching for conversation:', searchError);
    throw searchError;
  }

  if (existing) {
    return existing;
  }

  // Create new conversation
  const { data: newConversation, error: createError } = await supabase
    .from('conversations')
    .insert(data)
    .select()
    .single();

  if (createError) {
    console.error('Error creating conversation:', createError);
    throw createError;
  }

  return newConversation;
};

export const getUserConversations = async (): Promise<Conversation[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return data || [];
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

  return data || [];
};

export const createMessage = async (data: {
  conversation_id: string;
  sender_id: string;
  content: string;
  attachment?: string;
}): Promise<Message> => {
  const { data: message, error } = await supabase
    .from('messages')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating message:', error);
    throw error;
  }

  // Update conversation's last message
  await supabase
    .from('conversations')
    .update({
      last_message: data.content,
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', data.conversation_id);

  return message;
};

export const markMessageAsRead = async (messageId: string): Promise<void> => {
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId);

  if (error) {
    console.error('Error marking message as read:', error);
  }
};