
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
      profiles(id, email, role, business_name, created_at)
    `);

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }

  const messageData = data[0];
  return {
    id: messageData.id,
    order_id: messageData.order_id,
    sender_id: messageData.sender_id,
    message: messageData.message,
    created_at: messageData.created_at,
    profiles: messageData.profiles ? {
      id: messageData.profiles.id,
      email: messageData.profiles.email,
      role: messageData.profiles.role as any,
      business_name: messageData.profiles.business_name,
      created_at: messageData.profiles.created_at || new Date().toISOString()
    } : undefined
  } as OrderMessage;
};

// Get order messages
export const getOrderMessages = async (orderId: string): Promise<OrderMessage[]> => {
  const { data, error } = await supabase
    .from('order_messages')
    .select(`
      *,
      profiles(id, email, role, business_name, created_at)
    `)
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return (data || []).map(messageData => ({
    id: messageData.id,
    order_id: messageData.order_id,
    sender_id: messageData.sender_id,
    message: messageData.message,
    created_at: messageData.created_at,
    profiles: messageData.profiles ? {
      id: messageData.profiles.id,
      email: messageData.profiles.email,
      role: messageData.profiles.role as any,
      business_name: messageData.profiles.business_name,
      created_at: messageData.profiles.created_at || new Date().toISOString()
    } : undefined
  } as OrderMessage));
};
