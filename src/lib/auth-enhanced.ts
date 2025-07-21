
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { phoneSignIn, phoneSignUp } from '@/lib/phone-auth';

// Export UserRole for use in other components
export type { UserRole } from '@/lib/types';

// Clean up auth state to prevent "limbo" states
export const cleanupAuthState = () => {
  try {
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
  } catch (error) {
    console.warn('Auth state cleanup failed:', error);
  }
};

// Enhanced authentication with phone number support
export const enhancedSignIn = async (phoneOrEmail: string, password: string) => {
  try {
    console.log('🔐 Starting enhanced sign in process');
    
    // Determine if input is phone number or email
    const isPhoneNumber = /^[\d\s\+\-\(\)]+$/.test(phoneOrEmail.trim());
    
    if (isPhoneNumber) {
      // Use phone authentication
      return await phoneSignIn(phoneOrEmail, password);
    } else {
      // Use email authentication
      const cleanEmail = phoneOrEmail.toLowerCase().trim();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        console.error('Email sign in error:', error);
        
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

      console.log('✅ Enhanced email sign in successful');
      return data;
    }
  } catch (error) {
    console.error('Enhanced sign in error:', error);
    throw error;
  }
};

export const enhancedSignUp = async (
  emailOrPhone: string, 
  password: string, 
  role: UserRole,
  businessData?: Record<string, any>
) => {
  try {
    console.log('🔐 Starting enhanced sign up process');
    
    // Determine if input is phone number or email
    const isPhoneNumber = /^[\d\s\+\-\(\)]+$/.test(emailOrPhone.trim());
    
    if (isPhoneNumber) {
      // Use phone authentication
      return await phoneSignUp(emailOrPhone, password, role, businessData || {});
    } else {
      // Use email authentication
      const cleanEmail = emailOrPhone.toLowerCase().trim();
      
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
        console.error('Email sign up error:', error);
        
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

      // Show success message
      toast({
        title: "Account Created Successfully",
        description: "Please check your email to verify your account.",
        variant: "default"
      });

      console.log('✅ Enhanced email sign up successful');
      return data;
    }
  } catch (error) {
    console.error('Enhanced sign up error:', error);
    throw error;
  }
};

export const enhancedSignOut = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Clean up state first
    cleanupAuthState();
    
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    
    console.log('✅ Enhanced sign out successful');
  } catch (error) {
    console.error('Enhanced sign out error:', error);
    throw error;
  }
};
