import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/types';
import { validatePakistaniPhone, normalizePakistaniPhone } from './phone-utils';
import { authSecurityManager } from '@/lib/security/enhanced-auth-security';
import { validateAndSanitizeInput, checkFieldUniqueness } from '@/lib/security/simple-validation';

// Export types
export type { UserRole } from '@/lib/types';

// Auth state cleanup utility
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

// Enhanced sign-in with unified phone/email support
export const signIn = async (phoneOrEmail: string, password: string) => {
  try {
    console.log('🔐 Starting sign in process');
    
    // Security validation
    const securityCheck = await authSecurityManager.enforceSecureLogin(phoneOrEmail, password);
    if (!securityCheck.allowed) {
      throw new Error(securityCheck.message || 'Sign in blocked for security reasons');
    }
    
    const cleanInput = phoneOrEmail.trim();
    const isPhoneNumber = /^[\d\s\+\-\(\)]+$/.test(cleanInput);
    
    let authResult;
    if (isPhoneNumber) {
      authResult = await signInWithPhone(cleanInput, password);
    } else {
      authResult = await signInWithEmail(cleanInput.toLowerCase(), password);
    }
    
    // Record successful login
    await authSecurityManager.recordAuthAttempt(phoneOrEmail, true);
    console.log('✅ Sign in successful');
    return authResult;
  } catch (error) {
    console.error('Sign in error:', error);
    await authSecurityManager.recordAuthAttempt(phoneOrEmail, false);
    throw error;
  }
};

// Enhanced sign-up with unified phone/email support
export const signUp = async (
  emailOrPhone: string, 
  password: string, 
  role: UserRole = 'seller',
  businessData?: Record<string, any>
) => {
  try {
    console.log('🔐 Starting sign up process');
    
    // Password security validation
    const passwordSecurity = await authSecurityManager.validatePasswordSecurity(password);
    if (!passwordSecurity.isValid) {
      const errorMessage = passwordSecurity.isBreached 
        ? 'This password has been found in data breaches. Please choose a different password.'
        : passwordSecurity.errors.join('. ');
      throw new Error(errorMessage);
    }
    
    const cleanInput = emailOrPhone.trim();
    const isPhoneNumber = /^[\d\s\+\-\(\)]+$/.test(cleanInput);
    
    // Force new users to be sellers initially
    const defaultRole = 'seller';
    
    if (isPhoneNumber) {
      return await signUpWithPhone(cleanInput, password, defaultRole, businessData || {});
    } else {
      return await signUpWithEmail(cleanInput.toLowerCase(), password, defaultRole, businessData || {});
    }
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

// Enhanced sign-out
export const signOut = async () => {
  try {
    cleanupAuthState();
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) throw error;
    console.log('✅ Sign out successful');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Phone-based authentication with enhanced lookup
const signInWithPhone = async (phoneNumber: string, password: string) => {
  const normalizedPhone = normalizePakistaniPhone(phoneNumber);
  
  if (!validatePakistaniPhone(normalizedPhone)) {
    throw new Error('Please enter a valid Pakistani phone number');
  }

  console.log('🔍 Looking up user with phone:', phoneNumber, '→ normalized:', normalizedPhone);

  // Try multiple lookup strategies for phone authentication
  let authResult;
  
  // First try the enhanced function
  try {
    const { data: authData, error: authError } = await supabase
      .rpc('authenticate_user_by_phone', { user_phone: normalizedPhone });

    if (authError) {
      console.error('RPC authenticate_user_by_phone error:', authError);
      // Fallback to direct profile lookup
      throw authError;
    }

    authResult = authData as { success: boolean; error?: string; email?: string };
  } catch (rpcError) {
    console.warn('RPC failed, trying direct lookup:', rpcError);
    
    // Fallback: Direct profile lookup with multiple strategies
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, phone_number, normalized_phone')
      .or(`normalized_phone.eq.${normalizedPhone},phone_number.eq.${phoneNumber},phone_number.eq.${normalizedPhone},email.like.%${normalizedPhone}@temp-phone-auth.com,email.like.%${normalizedPhone}@phone.auth.local`)
      .limit(1)
      .maybeSingle();

    if (profileError) {
      console.error('Direct profile lookup error:', profileError);
      throw new Error('Database lookup failed');
    }

    if (profileData) {
      authResult = {
        success: true,
        email: profileData.email,
        user_id: profileData.id,
        role: profileData.role
      };
      console.log('✅ Found user via direct lookup:', profileData.id);
    } else {
      authResult = {
        success: false,
        error: 'No account found with this phone number'
      };
    }
  }
  
  if (!authResult.success) {
    console.error('❌ Phone lookup failed:', authResult.error);
    throw new Error(authResult.error || 'No account found with this phone number');
  }

  console.log('✅ Found user, attempting password authentication with email:', authResult.email);

  // Sign in with the found email
  const { data, error } = await supabase.auth.signInWithPassword({
    email: authResult.email!,
    password
  });

  if (error) {
    console.error('❌ Password authentication failed:', error);
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Invalid phone number or password');
    }
    throw new Error('Sign in failed. Please try again.');
  }

  console.log('🎉 Phone authentication successful');
  return data;
};

// Email-based authentication
const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Invalid email or password');
    } else if (error.message.includes('Email not confirmed')) {
      throw new Error('Please verify your email before signing in');
    }
    throw new Error('Sign in failed. Please try again.');
  }

  return data;
};

// Phone-based signup
const signUpWithPhone = async (
  phoneNumber: string, 
  password: string, 
  role: UserRole,
  businessData: Record<string, any>
) => {
  const normalizedPhone = normalizePakistaniPhone(phoneNumber);
  
  if (!validatePakistaniPhone(normalizedPhone)) {
    throw new Error('Please enter a valid Pakistani phone number');
  }

  // Check if phone already exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('normalized_phone', normalizedPhone)
    .maybeSingle();

  if (existingUser) {
    throw new Error('An account with this phone number already exists');
  }

  // Create unique email for Supabase auth - using actual domain
  const uniqueEmail = `${normalizedPhone}@pakbazaarconnect.store`;

  const { data, error } = await supabase.auth.signUp({
    email: uniqueEmail,
    password,
    phone: normalizedPhone, // Add phone to auth.users
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
      data: {
        role,
        phone_number: normalizedPhone,
        normalized_phone: normalizedPhone,
        contact_name: businessData.contactName || 'User',
        business_name: businessData.businessName || 'Business',
        business_type: businessData.businessType || 'Retailer',
        address: businessData.address || '',
        city: businessData.city || '',
        postal_code: businessData.postalCode || '',
        industry: businessData.industry || ''
      }
    }
  });

  if (error) {
    if (error.message.includes('User already registered')) {
      throw new Error('An account with this information already exists');
    }
    throw new Error('Registration failed. Please try again.');
  }

  // After successful signup, ensure profile is created properly
  if (data.user) {
    // Update the profile to ensure proper phone data storage
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        email: uniqueEmail,
        phone_number: normalizedPhone,
        normalized_phone: normalizedPhone,
        role,
        contact_name: businessData.contactName || 'User',
        business_name: businessData.businessName || 'Business',
        business_type: businessData.businessType || 'Retailer',
        address: businessData.address || '',
        city: businessData.city || '',
        postal_code: businessData.postalCode || '',
        industry: businessData.industry || '',
        years_in_business: businessData.yearsInBusiness || '1-3 years'
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }
  }

  return data;
};

// Email-based signup
const signUpWithEmail = async (
  email: string, 
  password: string, 
  role: UserRole,
  businessData: Record<string, any>
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
      data: {
        role,
        ...businessData
      }
    }
  });

  if (error) {
    if (error.message.includes('User already registered')) {
      throw new Error('An account with this email already exists');
    } else if (error.message.includes('Invalid email')) {
      throw new Error('Please enter a valid email address');
    }
    throw new Error('Registration failed. Please try again.');
  }

  return data;
};

// Utility functions
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