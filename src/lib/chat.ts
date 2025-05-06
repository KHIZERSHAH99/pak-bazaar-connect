
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

// Chat functions
export const saveChat = async (message: string, reply: string) => {
  const user = await getCurrentUser();
  
  if (!user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('chat_history')
    .insert([{
      user_id: user.id,
      message,
      reply
    }])
    .select();
  
  if (error) {
    console.error('Error saving chat:', error);
    throw error;
  }
  
  return data[0];
};

export const getChatHistory = async () => {
  const user = await getCurrentUser();
  
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('chat_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
  
  return data;
};
