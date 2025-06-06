
import { supabase } from '@/integrations/supabase/client';

// Audit logging
export const logSecurityEvent = async (event: string, details: any = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log(`Security Event: ${event}`, {
      user_id: user?.id,
      timestamp: new Date().toISOString(),
      details
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};
