
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

// Clean up auth state to prevent "limbo" states
const cleanupAuthState = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

// Authentication functions
export const signIn = async (email: string, password: string) => {
  try {
    console.log('Signing in with:', email);
    
    // Clean up existing auth state before signing in
    cleanupAuthState();
    
    try {
      // Try to sign out first to clear any existing session
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
      console.log('Global signout failed, continuing anyway:', err);
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Auth signin error:', error);
      throw error;
    }

    console.log('Signin successful, user data:', data);
    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    console.log('Signing up with email:', email);
    
    // Clean up existing auth state before signing up
    cleanupAuthState();
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error('Auth signup error:', error);
      throw error;
    }

    // The profile creation is handled by the database trigger
    console.log('Signup successful, user data:', data);
    return data;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    // Clean up auth state first
    cleanupAuthState();
    
    // Attempt global sign out
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    
    // Force page reload for a clean state
    window.location.href = '/';
    
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

export const getUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Get user profile error:', error);
    return null;
  }
};

// Role change request with improved error handling and notifications
export const requestRoleChange = async (requestedRole: UserRole) => {
  const user = await getCurrentUser();
  
  if (!user) throw new Error('User not authenticated');
  
  // Check if there's already a pending request
  const { data: existingRequests, error: checkError } = await supabase
    .from('role_requests')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending');
  
  if (checkError) {
    console.error('Error checking existing requests:', checkError);
    toast({
      title: "Request Failed",
      description: "Error checking existing requests. Please try again later.",
      variant: "destructive"
    });
    throw checkError;
  }
  
  if (existingRequests && existingRequests.length > 0) {
    toast({
      title: "Request Pending",
      description: "You already have a pending role change request. Please wait for approval.",
      variant: "warning"
    });
    throw new Error('You already have a pending role change request');
  }
  
  // Create new role request
  const { data, error } = await supabase
    .from('role_requests')
    .insert([{ user_id: user.id, requested_role: requestedRole, status: 'pending' }])
    .select();
  
  if (error) {
    console.error('Error creating role change request:', error);
    toast({
      title: "Request Failed",
      description: "Error creating role change request. Please try again later.",
      variant: "destructive"
    });
    throw error;
  }
  
  toast({
    title: "Request Submitted",
    description: "Your role change request has been submitted successfully.",
    variant: "default"
  });
  
  return data[0];
};
