/**
 * Unified Authentication System
 * Handles both email and phone number authentication
 */

import { supabase } from '@/integrations/supabase/client';
import { detectInputType, type InputValidation } from './input-detector';
import { UserRole } from '@/types/auth';

interface AuthResponse {
  success: boolean;
  user_id?: string;
  email?: string;
  role?: string;
  auth_type?: string;
  identifier?: string;
  error?: string;
}

/**
 * Unified sign in function for email and phone
 */
export async function unifiedSignIn(identifier: string, password: string) {
  try {
    // Detect input type
    const validation = detectInputType(identifier);
    
    if (!validation.isValid) {
      return { 
        data: null, 
        error: new Error(validation.error || 'Invalid input format') 
      };
    }
    
    let authEmail: string;
    
    if (validation.type === 'email') {
      // Direct email authentication
      authEmail = validation.value;
    } else if (validation.type === 'phone') {
      // For phone, lookup the user's auth email
      const { data: authData } = await supabase.rpc('authenticate_user_by_identifier', {
        identifier: validation.value
      });
      
      const authResponse = authData as unknown as AuthResponse | null;
      
      if (!authResponse?.success) {
        return {
          data: null,
          error: new Error(authResponse?.error || 'Invalid phone number or password')
        };
      }
      
      authEmail = authResponse.email || '';
    } else {
      return { 
        data: null, 
        error: new Error('Please enter a valid email or phone number') 
      };
    }
    
    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password
    });
    
    if (error) {
      // Log failed attempt
      await supabase.rpc('log_auth_attempt', {
        p_identifier: identifier,
        p_success: false
      });
      
      return { data: null, error };
    }
    
    // Log successful attempt
    await supabase.rpc('log_auth_attempt', {
      p_identifier: identifier,
      p_success: true
    });
    
    return { data, error: null };
    
  } catch (error) {
    console.error('Sign in error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Authentication failed') 
    };
  }
}

/**
 * Unified sign up function for email and phone
 */
export async function unifiedSignUp(
  identifier: string, 
  password: string, 
  role: UserRole,
  additionalData?: Record<string, any>
) {
  try {
    // Validate password strength
    if (!password || password.length < 8) {
      return {
        data: null,
        error: new Error('Password must be at least 8 characters long')
      };
    }
    
    // Detect input type
    const validation = detectInputType(identifier);
    
    if (!validation.isValid) {
      return { 
        data: null, 
        error: new Error(validation.error || 'Invalid input format') 
      };
    }
    
    let authEmail: string;
    let isEmailUser = false;
    let displayIdentifier = identifier;
    
    if (validation.type === 'email') {
      // Direct email registration
      authEmail = validation.value;
      isEmailUser = true;
      displayIdentifier = authEmail;
      
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', authEmail)
        .eq('is_email_user', true)
        .single();
        
      if (existingUser) {
        return {
          data: null,
          error: new Error('An account with this email already exists')
        };
      }
    } else if (validation.type === 'phone') {
      // Phone registration with system email
      const phoneNumber = validation.value;
      displayIdentifier = phoneNumber;
      
      // Check if phone already exists
      const { data: existingPhone } = await supabase
        .from('profiles')
        .select('id')
        .eq('normalized_phone', phoneNumber)
        .single();
        
      if (existingPhone) {
        return {
          data: null,
          error: new Error('An account with this phone number already exists')
        };
      }
      
      // Create system email for phone users
      authEmail = `${phoneNumber}@pakbazaarconnect.store`;
    } else {
      return { 
        data: null, 
        error: new Error('Please enter a valid email or phone number') 
      };
    }
    
    // Create Supabase auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          role,
          auth_type: validation.type,
          is_email_user: isEmailUser,
          display_identifier: displayIdentifier,
          ...additionalData
        }
      }
    });
    
    if (authError) {
      return { data: null, error: authError };
    }
    
    // Update profile with additional data
    if (authData?.user) {
      const profileData: any = {
        id: authData.user.id,
        email: authEmail,
        role,
        auth_type: validation.type,
        is_email_user: isEmailUser,
        display_identifier: displayIdentifier,
        ...additionalData
      };
      
      // Add phone-specific data
      if (validation.type === 'phone') {
        profileData.phone_number = validation.value;
        profileData.normalized_phone = validation.value;
      }
      
      await supabase
        .from('profiles')
        .upsert(profileData)
        .eq('id', authData.user.id);
    }
    
    return { data: authData, error: null };
    
  } catch (error) {
    console.error('Sign up error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Registration failed') 
    };
  }
}