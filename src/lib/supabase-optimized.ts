
import { supabase } from '@/integrations/supabase/client';
import { optimizedQueryService } from './performance/optimized-queries';
import { performanceService } from './performance/optimization-service';
import { Profile, UserRole, validateProfile } from './types';

// Optimized profile functions
export const getOptimizedUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const data = await optimizedQueryService.getUserProfile(userId);
    return validateProfile(data);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const updateOptimizedUserProfile = async (
  userId: string, 
  updates: Partial<Profile>
): Promise<{ data: Profile | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    optimizedQueryService.invalidateUserCache(userId);
    
    const validatedProfile = validateProfile(data);
    return { data: validatedProfile, error: null };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { data: null, error: error.message };
  }
};

// Optimized auth functions with reduced logging
export const signInOptimized = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    });

    if (error) throw error;

    // Preload user data in background
    if (data.user) {
      const profile = await getOptimizedUserProfile(data.user.id);
      if (profile) {
        performanceService.preloadUserData(data.user.id, profile.role);
      }
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { data: null, error: error.message };
  }
};

// Safe audit logging that doesn't fail if function doesn't exist
export const safeAuditLog = async (
  userId: string,
  eventType: string,
  details: Record<string, any> = {}
) => {
  try {
    // Check if audit function exists before calling
    const { error } = await supabase.rpc('log_audit_event', {
      p_user_id: userId,
      p_event_type: eventType,
      p_table_name: details.table_name || null,
      p_record_id: details.record_id || null,
      p_old_values: details.old_values ? JSON.stringify(details.old_values) : null,
      p_new_values: details.new_values ? JSON.stringify(details.new_values) : null,
      p_user_agent: navigator.userAgent
    });

    // Don't throw error if function doesn't exist
    if (error && !error.message.includes('does not exist')) {
      console.warn('Audit log warning:', error);
    }
  } catch (error) {
    // Silently handle audit logging errors
    console.warn('Audit logging failed:', error);
  }
};

// Batch operations for better performance
export const batchUpdateProfiles = async (updates: Array<{ id: string; data: Partial<Profile> }>) => {
  try {
    const promises = updates.map(({ id, data }) => 
      supabase.from('profiles').update(data).eq('id', id)
    );
    
    const results = await Promise.allSettled(promises);
    
    // Invalidate all affected caches
    updates.forEach(({ id }) => optimizedQueryService.invalidateUserCache(id));
    
    return results;
  } catch (error) {
    console.error('Batch update error:', error);
    throw error;
  }
};
