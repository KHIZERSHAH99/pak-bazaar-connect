
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

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

// Simplified audit logging function with timeout
const logAuditEvent = async (
  eventType: string,
  tableName?: string,
  recordId?: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
  userAgent?: string
) => {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error('Audit log timeout')), 5000);
    });

    const logPromise = (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.rpc('log_audit_event', {
        p_user_id: user?.id || null,
        p_event_type: eventType,
        p_table_name: tableName || null,
        p_record_id: recordId || null,
        p_old_values: oldValues ? JSON.stringify(oldValues) : null,
        p_new_values: newValues ? JSON.stringify(newValues) : null,
        p_user_agent: userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : null)
      });

      if (error) {
        console.error('Audit logging error:', error);
      }
    })();

    await Promise.race([logPromise, timeoutPromise]);
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw error to avoid breaking the main flow
  }
};

// Simplified server-side rate limiting with timeout
const checkServerRateLimit = async (identifier: string, attemptType: string): Promise<{ allowed: boolean; message?: string }> => {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<{ allowed: boolean }>((resolve) => {
      setTimeout(() => resolve({ allowed: true }), 3000); // Allow on timeout
    });

    const checkPromise = (async () => {
      const fifteenMinutesAgo = new Date(Date.now() - (15 * 60 * 1000)).toISOString();
      
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id')
        .eq('event_type', `${attemptType}_attempt`)
        .gte('created_at', fifteenMinutesAgo)
        .limit(10);
      
      if (error) {
        console.error('Rate limit check error:', error);
        return { allowed: true };
      }
      
      const attemptCount = data?.length || 0;
      
      if (attemptCount >= 5) {
        return { 
          allowed: false, 
          message: 'Too many attempts. Please try again in 15 minutes.' 
        };
      }
      
      return { allowed: true };
    })();

    return await Promise.race([checkPromise, timeoutPromise]);
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true }; // Allow on error
  }
};

// Enhanced authentication with comprehensive security logging and rate limiting
export const enhancedSignIn = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting enhanced sign in process');
    
    const cleanEmail = email.toLowerCase().trim();
    
    // Check server-side rate limit with timeout
    const rateLimitResult = await checkServerRateLimit(cleanEmail, 'login');
    
    if (!rateLimitResult.allowed) {
      const errorMessage = rateLimitResult.message || 'Too many login attempts. Please try again later.';
      toast({
        title: "Login Temporarily Blocked",
        description: errorMessage,
        variant: "destructive"
      });
      throw new Error(errorMessage);
    }
    
    // Log login attempt (fire and forget)
    logAuditEvent('login_attempt', 'profiles', undefined, undefined, { 
      email: cleanEmail,
      timestamp: new Date().toISOString()
    }).catch(() => {}); // Ignore audit errors
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      
      // Log failed login attempt (fire and forget)
      logAuditEvent('login_failed', 'profiles', undefined, undefined, { 
        email: cleanEmail, 
        error: error.message,
        timestamp: new Date().toISOString()
      }).catch(() => {});
      
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

    // Log successful login (fire and forget)
    logAuditEvent('login_success', 'profiles', data.user?.id, undefined, { 
      email: cleanEmail,
      timestamp: new Date().toISOString()
    }).catch(() => {});

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
  businessData?: Record<string, any>
) => {
  try {
    console.log('🔐 Starting enhanced sign up process', { email, role });
    
    const cleanEmail = email.toLowerCase().trim();
    
    // Check server-side rate limit with timeout
    const rateLimitResult = await checkServerRateLimit(cleanEmail, 'signup');
    
    if (!rateLimitResult.allowed) {
      const errorMessage = rateLimitResult.message || 'Too many signup attempts. Please try again later.';
      toast({
        title: "Signup Temporarily Blocked",
        description: errorMessage,
        variant: "destructive"
      });
      throw new Error(errorMessage);
    }
    
    // Log signup attempt (fire and forget)
    logAuditEvent('signup_attempt', 'profiles', undefined, undefined, { 
      email: cleanEmail,
      role,
      timestamp: new Date().toISOString()
    }).catch(() => {});
    
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
      
      // Log failed signup attempt (fire and forget)
      logAuditEvent('signup_failed', 'profiles', undefined, undefined, { 
        email: cleanEmail, 
        role,
        error: error.message,
        timestamp: new Date().toISOString()
      }).catch(() => {});
      
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

    // Log successful signup (fire and forget)
    logAuditEvent('signup_success', 'profiles', data.user?.id, undefined, { 
      email: cleanEmail,
      role,
      timestamp: new Date().toISOString()
    }).catch(() => {});

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
    
    // Log logout attempt (fire and forget)
    logAuditEvent('logout_attempt', 'profiles', user?.id, undefined, {
      timestamp: new Date().toISOString()
    }).catch(() => {});
    
    // Clean up state first
    cleanupAuthState();
    
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.error('Sign out error:', error);
      logAuditEvent('logout_failed', 'profiles', user?.id, undefined, {
        error: error.message,
        timestamp: new Date().toISOString()
      }).catch(() => {});
      throw error;
    }
    
    // Log successful logout (fire and forget)
    logAuditEvent('logout_success', 'profiles', user?.id, undefined, {
      timestamp: new Date().toISOString()
    }).catch(() => {});
    
    console.log('✅ Enhanced sign out successful');
  } catch (error) {
    console.error('Enhanced sign out error:', error);
    throw error;
  }
};
