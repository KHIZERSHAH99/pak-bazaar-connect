
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { validateEmail, checkRateLimit, logSecurityEvent } from './security';

// Enhanced authentication with security features
export const enhancedSignIn = async (email: string, password: string) => {
  try {
    // Rate limiting check
    if (!checkRateLimit(`login:${email}`, 5, 300000)) { // 5 attempts per 5 minutes
      throw new Error('Too many login attempts. Please try again later.');
    }

    // Input validation
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    console.log('Signing in with:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });
    
    if (error) {
      await logSecurityEvent('login_failed', { email, error: error.message });
      console.error('Auth signin error:', error);
      throw error;
    }

    await logSecurityEvent('login_success', { email });
    console.log('Signin successful, user data:', data);
    return data;
  } catch (error) {
    console.error('Enhanced sign in error:', error);
    throw error;
  }
};

export const enhancedSignUp = async (email: string, password: string, role: UserRole = 'wholesaler') => {
  try {
    // Rate limiting check
    if (!checkRateLimit(`signup:${email}`, 3, 3600000)) { // 3 attempts per hour
      throw new Error('Too many signup attempts. Please try again later.');
    }

    // Input validation
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    console.log('Signing up with email:', email, 'and role:', role);
    
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          role: role
        }
      }
    });
    
    if (error) {
      await logSecurityEvent('signup_failed', { email, error: error.message });
      console.error('Auth signup error:', error);
      throw error;
    }

    // Update the profile with the selected role immediately
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: role })
        .eq('id', data.user.id);
      
      if (profileError) {
        console.error('Error updating profile role:', profileError);
      }
    }

    await logSecurityEvent('signup_success', { email, role });
    console.log('Signup successful, user data:', data);
    return data;
  } catch (error) {
    console.error('Enhanced sign up error:', error);
    throw error;
  }
};

// Secure role change with validation
export const secureChangeRole = async (newRole: UserRole) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    // Validate role
    const validRoles: UserRole[] = ['admin', 'wholesaler', 'seller', 'pending'];
    if (!validRoles.includes(newRole)) {
      throw new Error('Invalid role specified');
    }

    // Prevent admin role changes (should be handled separately)
    if (newRole === 'admin') {
      throw new Error('Admin role cannot be assigned through role change');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id)
      .select();
    
    if (error) {
      await logSecurityEvent('role_change_failed', { 
        user_id: user.id, 
        requested_role: newRole, 
        error: error.message 
      });
      console.error('Error changing role:', error);
      throw error;
    }
    
    await logSecurityEvent('role_change_success', { 
      user_id: user.id, 
      new_role: newRole 
    });

    toast({
      title: "Role Changed Successfully",
      description: `Your role has been changed to ${newRole}.`,
      variant: "default"
    });
    
    return data[0];
  } catch (error) {
    console.error('Secure role change error:', error);
    throw error;
  }
};

// Enhanced sign out with cleanup
export const enhancedSignOut = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await logSecurityEvent('logout', { user_id: user.id });
    }
    
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    
    // Force page reload for clean state
    window.location.href = '/';
    
    return true;
  } catch (error) {
    console.error('Enhanced sign out error:', error);
    throw error;
  }
};
