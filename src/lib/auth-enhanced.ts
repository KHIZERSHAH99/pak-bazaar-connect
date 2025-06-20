
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { logAuditEvent } from '@/lib/security/audit-enhanced';
import { RoleSwitchResponse } from '@/types/role-switch';

// Export UserRole for use in other components
export type { UserRole } from '@/lib/types';

// Clean up auth state to prevent "limbo" states
export const cleanupAuthState = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

// Enhanced authentication with comprehensive security logging
export const enhancedSignIn = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting enhanced sign in process');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      
      // Log failed login attempt
      await logAuditEvent('login_failed', null, null, null, { 
        email: email.toLowerCase().trim(), 
        error: error.message 
      });
      
      throw error;
    }

    // Log successful login
    await logAuditEvent('login_success', 'profiles', data.user?.id, null, { 
      email: email.toLowerCase().trim() 
    });

    console.log('✅ Enhanced sign in successful');
    return data;
  } catch (error) {
    console.error('Enhanced sign in error:', error);
    throw error;
  }
};

export const enhancedSignUp = async (
  email: string, 
  password: string, 
  role: UserRole,
  businessData?: any
) => {
  try {
    console.log('🔐 Starting enhanced sign up process', { email, role });
    
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          role: role,
          ...businessData
        }
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      
      // Log failed signup attempt
      await logAuditEvent('signup_failed', null, null, null, { 
        email: email.toLowerCase().trim(), 
        role,
        error: error.message 
      });
      
      throw error;
    }

    // Log successful signup
    await logAuditEvent('signup_success', 'profiles', data.user?.id, null, { 
      email: email.toLowerCase().trim(),
      role 
    });

    console.log('✅ Enhanced sign up successful');
    return data;
  } catch (error) {
    console.error('Enhanced sign up error:', error);
    throw error;
  }
};

export const enhancedSignOut = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Log logout attempt
    await logAuditEvent('logout', 'profiles', user?.id);
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    
    // Clear any cached data
    localStorage.removeItem('user_profile');
    sessionStorage.clear();
    
    console.log('✅ Enhanced sign out successful');
  } catch (error) {
    console.error('Enhanced sign out error:', error);
    throw error;
  }
};

// Updated role change function - now creates admin approval requests for sensitive role changes
export const secureChangeRole = async (newRole: UserRole) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    // For direct business role switching (seller <-> wholesaler), use the database function
    if (newRole === 'seller' || newRole === 'wholesaler') {
      const { data, error } = await supabase.rpc('switch_business_role', {
        target_role: newRole
      });

      if (error) throw error;
      
      // Type cast the response data
      const response = data as RoleSwitchResponse;
      
      if (!response.success) throw new Error(response.error);

      toast({
        title: "Role Changed Successfully",
        description: `You are now a ${newRole}!`,
      });

      return { success: true };
    }

    // For admin role changes, create a role request (requires approval)
    await logAuditEvent('role_change_requested', 'role_requests', null, null, { 
      old_role: 'pending',
      requested_role: newRole 
    });

    const { data, error } = await supabase
      .from('role_requests')
      .insert([{
        user_id: user.id,
        requested_role: newRole,
        status: 'pending'
      }])
      .select();

    if (error) {
      console.error('Role change request error:', error);
      throw error;
    }

    toast({
      title: "Role Change Requested",
      description: "Your request has been submitted for admin approval.",
    });

    return data[0];
  } catch (error) {
    console.error('Secure role change error:', error);
    throw error;
  }
};
