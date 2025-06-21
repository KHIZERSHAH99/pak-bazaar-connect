
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

// Helper function to check rate limits
const checkRateLimit = async (identifier: string, attemptType: string) => {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_attempt_type: attemptType,
      p_max_attempts: attemptType === 'login' ? 5 : 3,
      p_window_minutes: 15
    });

    if (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true }; // Allow on error to not block legitimate users
    }

    return data;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true }; // Allow on error
  }
};

// Enhanced authentication with comprehensive security logging and rate limiting
export const enhancedSignIn = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting enhanced sign in process with rate limiting');
    
    const cleanEmail = email.toLowerCase().trim();
    
    // Check rate limit before attempting login
    const rateLimitResult = await checkRateLimit(cleanEmail, 'login');
    
    if (!rateLimitResult.allowed) {
      const errorMessage = rateLimitResult.message || 'Too many login attempts. Please try again later.';
      toast({
        title: "Login Temporarily Blocked",
        description: errorMessage,
        variant: "destructive"
      });
      throw new Error(errorMessage);
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      
      // Log failed login attempt
      await logAuditEvent('login_failed', null, null, null, { 
        email: cleanEmail, 
        error: error.message 
      });
      
      // Show user-friendly error messages
      let userMessage = 'Invalid email or password. Please try again.';
      if (error.message.includes('Email not confirmed')) {
        userMessage = 'Please check your email and confirm your account before signing in.';
      } else if (error.message.includes('Invalid login credentials')) {
        userMessage = 'Invalid email or password. Please check your credentials.';
      }
      
      toast({
        title: "Sign In Failed",
        description: userMessage,
        variant: "destructive"
      });
      
      throw error;
    }

    // Log successful login
    await logAuditEvent('login_success', 'profiles', data.user?.id, null, { 
      email: cleanEmail 
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
    console.log('🔐 Starting enhanced sign up process with rate limiting', { email, role });
    
    const cleanEmail = email.toLowerCase().trim();
    
    // Check rate limit before attempting signup
    const rateLimitResult = await checkRateLimit(cleanEmail, 'signup');
    
    if (!rateLimitResult.allowed) {
      const errorMessage = rateLimitResult.message || 'Too many signup attempts. Please try again later.';
      toast({
        title: "Signup Temporarily Blocked",
        description: errorMessage,
        variant: "destructive"
      });
      throw new Error(errorMessage);
    }
    
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
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
        email: cleanEmail, 
        role,
        error: error.message 
      });
      
      // Show user-friendly error messages
      let userMessage = 'Failed to create account. Please try again.';
      if (error.message.includes('User already registered')) {
        userMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.message.includes('Password should be at least')) {
        userMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.message.includes('Invalid email')) {
        userMessage = 'Please enter a valid email address.';
      }
      
      toast({
        title: "Sign Up Failed",
        description: userMessage,
        variant: "destructive"
      });
      
      throw error;
    }

    // Log successful signup
    await logAuditEvent('signup_success', 'profiles', data.user?.id, null, { 
      email: cleanEmail,
      role 
    });

    // Show success message
    toast({
      title: "Account Created Successfully",
      description: "Please check your email to verify your account.",
      variant: "default"
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

// Updated role change function - now uses the secure function
export const secureChangeRole = async (newRole: UserRole) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    // Use the new secure role switching function
    const { data, error } = await supabase.rpc('secure_switch_business_role', {
      target_role: newRole
    });

    if (error) throw error;
    
    // Type cast the response data
    const response = data as unknown as RoleSwitchResponse;
    
    if (!response.success) throw new Error(response.error);

    toast({
      title: "Role Changed Successfully",
      description: `You are now a ${newRole}!`,
    });

    return { success: true };
  } catch (error) {
    console.error('Secure role change error:', error);
    throw error;
  }
};
