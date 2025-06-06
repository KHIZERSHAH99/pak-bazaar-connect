
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/types';

// Authorization utilities
export const checkUserRole = async (): Promise<UserRole | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return data.role as UserRole;
  } catch (error) {
    console.error('Role check error:', error);
    return null;
  }
};

export const isAdmin = async (): Promise<boolean> => {
  const role = await checkUserRole();
  return role === 'admin';
};

export const isShopOwner = async (shopId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', shopId)
      .single();

    if (error) {
      console.error('Error checking shop ownership:', error);
      return false;
    }

    return data.owner_id === user.id;
  } catch (error) {
    console.error('Shop ownership check error:', error);
    return false;
  }
};
