import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnread = async () => {
      // Get all conversation IDs for this user
      const { data: convos } = await supabase
        .from('conversations')
        .select('id')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

      if (!convos?.length) {
        setUnreadCount(0);
        return;
      }

      const convIds = convos.map(c => c.id);

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', convIds)
        .neq('sender_id', user.id)
        .is('read_at', null);

      setUnreadCount(count || 0);
    };

    fetchUnread();

    // Subscribe to new messages
    const channel = supabase
      .channel('unread-messages-count')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => fetchUnread()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        () => fetchUnread()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return unreadCount;
}
