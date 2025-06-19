
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/types';
import { rateLimiter, RATE_LIMITS, getClientIdentifier } from './security/rateLimit';
import { validateAndSanitizeInput, validatePhoneNumber } from './security/validation';
import { logSecurityEvent } from './security/audit';

// Enhanced authentication with comprehensive security measures
export const enhancedSignIn = async (email: string, password: string) => {
  // Rate limiting for login attempts
  const clientId = getClientIdentifier();
  const rateLimitResult = await rateLimiter.checkRateLimit(
    `login_${clientId}_${email}`,
    RATE_LIMITS.LOGIN.maxRequests,
    RATE_LIMITS.LOGIN.windowMs
  );

  if (!rateLimitResult.allowed) {
    await logSecurityEvent('login_rate_limit_exceeded', { 
      email: email.toLowerCase(),
      remaining_attempts: rateLimitResult.remaining,
      reset_time: new Date(rateLimitResult.resetTime).toISOString()
    });
    throw new Error(`Too many login attempts. Try again in ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000)} minutes.`);
  }

  // Input validation
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const sanitizedEmail = validateAndSanitizeInput(email.toLowerCase(), 'text');
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
    throw new Error('Invalid email format');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password: password
    });

    if (error) {
      await logSecurityEvent('login_failed', { 
        email: sanitizedEmail,
        error: error.message,
        attempts_remaining: rateLimitResult.remaining - 1
      });
      throw error;
    }

    if (data.user) {
      await logSecurityEvent('login_successful', { 
        user_id: data.user.id,
        email: sanitizedEmail
      });
    }

    return data;
  } catch (error: any) {
    console.error('Enhanced sign in error:', error);
    throw new Error(error.message || 'Login failed. Please check your credentials.');
  }
};

export const enhancedSignUp = async (email: string, password: string, role: UserRole = 'pending', additionalData?: any) => {
  // Rate limiting for signup attempts
  const clientId = getClientIdentifier();
  const rateLimitResult = await rateLimiter.checkRateLimit(
    `signup_${clientId}`,
    RATE_LIMITS.SIGNUP.maxRequests,
    RATE_LIMITS.SIGNUP.windowMs
  );

  if (!rateLimitResult.allowed) {
    await logSecurityEvent('signup_rate_limit_exceeded', { 
      email: email.toLowerCase(),
      remaining_attempts: rateLimitResult.remaining
    });
    throw new Error(`Too many signup attempts. Try again in ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000)} minutes.`);
  }

  // Input validation
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const sanitizedEmail = validateAndSanitizeInput(email.toLowerCase(), 'text');
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
    throw new Error('Invalid email format');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  // Password strength validation
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }

  // Validate additional data if provided
  let sanitizedAdditionalData: any = {};
  if (additionalData) {
    if (additionalData.business_name) {
      sanitizedAdditionalData.business_name = validateAndSanitizeInput(additionalData.business_name, 'business');
    }
    if (additionalData.contact_name) {
      sanitizedAdditionalData.contact_name = validateAndSanitizeInput(additionalData.contact_name, 'text');
    }
    if (additionalData.phone_number) {
      if (!validatePhoneNumber(additionalData.phone_number)) {
        throw new Error('Invalid Pakistani phone number format');
      }
      sanitizedAdditionalData.phone_number = additionalData.phone_number;
    }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password: password,
      options: {
        data: {
          role: role,
          ...sanitizedAdditionalData
        }
      }
    });

    if (error) {
      await logSecurityEvent('signup_failed', { 
        email: sanitizedEmail,
        role: role,
        error: error.message
      });
      throw error;
    }

    if (data.user) {
      await logSecurityEvent('signup_successful', { 
        user_id: data.user.id,
        email: sanitizedEmail,
        role: role
      });
    }

    return data;
  } catch (error: any) {
    console.error('Enhanced sign up error:', error);
    throw new Error(error.message || 'Signup failed. Please try again.');
  }
};

export const enhancedSignOut = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await logSecurityEvent('logout', { user_id: user.id });
    }

    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }

    // Clear any cached data
    if (typeof window !== 'undefined') {
      // Clear sensitive data from localStorage
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('auth') || key.includes('user')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }

  } catch (error: any) {
    console.error('Enhanced sign out error:', error);
    throw new Error(error.message || 'Logout failed');
  }
};

export const secureChangeRole = async (newRole: UserRole) => {
  // Rate limiting
  const clientId = getClientIdentifier();
  const rateLimitResult = await rateLimiter.checkRateLimit(
    `change_role_${clientId}`,
    RATE_LIMITS.API_GENERAL.maxRequests,
    RATE_LIMITS.API_GENERAL.windowMs
  );

  if (!rateLimitResult.allowed) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  // Validate role
  const validRoles: UserRole[] = ['admin', 'wholesaler', 'seller', 'pending'];
  if (!validRoles.includes(newRole)) {
    throw new Error('Invalid role specified');
  }

  // Admin role is restricted
  if (newRole === 'admin') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();
    
    if (!profile || profile.email !== 'khizerfight@gmail.com') {
      await logSecurityEvent('unauthorized_admin_attempt', { 
        user_id: user.id,
        attempted_role: newRole
      });
      throw new Error('Unauthorized: Admin role is restricted');
    }
  }

  try {
    // Create role request for approval (except for admin)
    if (newRole !== 'admin') {
      const { error: requestError } = await supabase
        .from('role_requests')
        .insert([{
          user_id: user.id,
          requested_role: newRole,
          status: 'pending'
        }]);

      if (requestError) {
        console.error('Role request error:', requestError);
        throw new Error('Failed to submit role change request');
      }

      await logSecurityEvent('role_change_requested', { 
        user_id: user.id,
        requested_role: newRole
      });

      return { success: true, message: 'Role change request submitted for approval' };
    } else {
      // Direct role change for admin
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      await logSecurityEvent('role_changed', { 
        user_id: user.id,
        new_role: newRole
      });

      return { success: true, message: 'Role changed successfully' };
    }
  } catch (error: any) {
    console.error('Secure role change error:', error);
    throw new Error(error.message || 'Role change failed');
  }
};
