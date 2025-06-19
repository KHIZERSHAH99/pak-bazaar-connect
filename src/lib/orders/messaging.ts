
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { OrderMessage } from '@/lib/types';

// Send order message
export const sendOrderMessage = async (orderId: string, message: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('order_messages')
    .insert([{
      order_id: orderId,
      sender_id: user.id,
      message
    }])
    .select(`
      *,
      profiles(id, email, role, business_name)
    `);

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }

  return {
    ...data[0],
    profiles: data[0].profiles ? {
      ...data[0].profiles,
      role: data[0].profiles.role as any
    } : undefined
  };
};

// Get order messages
export const getOrderMessages = async (orderId: string): Promise<OrderMessage[]> => {
  const { data, error } = await supabase
    .from('order_messages')
    .select(`
      *,
      profiles(id, email, role, business_name)
    `)
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return (data || []).map(message => ({
    ...message,
    profiles: message.profiles ? {
      ...message.profiles,
      role: message.profiles.role as any
    } : undefined
  }));
};
