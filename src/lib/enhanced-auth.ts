
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from './types';
import { validatePasswordSecurity } from './security/enhanced-password-security';
import { validateAndSanitizeInput, checkFieldUniqueness } from './security/simple-validation';
import { checkLoginRateLimit, checkSignupRateLimit, enhancedRateLimiter } from './security/enhanced-rate-limiting';
import { checkDemoCredentialSecurity, validateBusinessCredentials, logCredentialSecurityEvent } from './security/demo-credential-blocker';

// Enhanced authentication with comprehensive security
export const enhancedSignIn = async (emailOrPhone: string, password: string) => {
  try {
    // Get client fingerprint for rate limiting
    const clientId = enhancedRateLimiter.getClientFingerprint();
    
    // Check rate limiting
    const rateLimitResult = await checkLoginRateLimit(clientId);
    if (!rateLimitResult.allowed) {
      const error = rateLimitResult.isBlocked 
        ? `Too many failed attempts. Please try again in ${Math.ceil((rateLimitResult.retryAfter || 0) / 60000)} minutes.`
        : 'Rate limit exceeded. Please slow down.';
      throw new Error(error);
    }

    // Validate and sanitize input
    const emailValidation = await validateAndSanitizeInput(
      emailOrPhone, 
      emailOrPhone.includes('@') ? 'email' : 'phone'
    );
    
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.errors[0] || 'Invalid input format');
    }

    // Check for demo credentials in production
    const securityCheck = checkDemoCredentialSecurity(
      emailOrPhone.includes('@') ? emailOrPhone : undefined,
      !emailOrPhone.includes('@') ? emailOrPhone : undefined,
      password
    );
    
    if (securityCheck.isBlocked) {
      await logCredentialSecurityEvent('demo_credential_blocked', {
        email: emailOrPhone.includes('@') ? emailOrPhone : undefined,
        phone: !emailOrPhone.includes('@') ? emailOrPhone : undefined,
        reason: securityCheck.reason
      });
      throw new Error(securityCheck.reason || 'Authentication blocked');
    }

    // Clean up any existing auth state first
    await supabase.auth.signOut({ scope: 'global' });
    
    // Determine if input is email or phone
    const isEmail = emailOrPhone.includes('@');
    const loginEmail = isEmail ? emailOrPhone : `${emailOrPhone.replace(/[^0-9]/g, '')}@pakbazaarconnect.store`;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.toLowerCase().trim(),
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No user data returned');
    }

    // Verify user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      // Create profile if it doesn't exist
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email || '',
          phone_number: isEmail ? '03000000000' : emailOrPhone,
          role: 'seller',
          contact_name: 'User',
          business_name: 'Business'
        });
      
      if (createError) {
        console.error('Profile creation error:', createError);
      }
    }

    return { user: data.user, session: data.session };
  } catch (error: any) {
    console.error('Enhanced sign in error:', error);
    throw error;
  }
};

export const enhancedSignUp = async (
  email: string, 
  password: string, 
  role: UserRole, 
  formData: any
) => {
  try {
    // Get client fingerprint for rate limiting
    const clientId = enhancedRateLimiter.getClientFingerprint();
    
    // Check rate limiting
    const rateLimitResult = await checkSignupRateLimit(clientId);
    if (!rateLimitResult.allowed) {
      const error = rateLimitResult.isBlocked 
        ? `Too many signup attempts. Please try again in ${Math.ceil((rateLimitResult.retryAfter || 0) / 60000)} minutes.`
        : 'Rate limit exceeded. Please slow down.';
      throw new Error(error);
    }

    // Validate password security
    const passwordValidation = await validatePasswordSecurity(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors[0] || 'Password does not meet security requirements');
    }

    // Validate and sanitize email
    const emailValidation = await validateAndSanitizeInput(email, 'email');
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.errors[0] || 'Invalid email format');
    }

    // Validate and sanitize phone
    if (formData.phoneNumber) {
      const phoneValidation = await validateAndSanitizeInput(formData.phoneNumber, 'phone');
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.errors[0] || 'Invalid phone number format');
      }
      formData.phoneNumber = phoneValidation.sanitizedValue;
    }

    // Check field uniqueness
    const emailExists = await checkFieldUniqueness('email', emailValidation.sanitizedValue);
    if (emailExists) {
      throw new Error('An account with this email already exists');
    }

    if (formData.phoneNumber) {
      const phoneExists = await checkFieldUniqueness('phone', formData.phoneNumber);
      if (phoneExists) {
        throw new Error('An account with this phone number already exists');
      }
    }

    // Validate business credentials
    const businessValidation = await validateBusinessCredentials({
      email: emailValidation.sanitizedValue,
      phone_number: formData.phoneNumber || '',
      business_name: formData.businessName || '',
      contact_name: formData.contactName || ''
    });

    if (businessValidation.isBlocked) {
      throw new Error(businessValidation.reason || 'Registration blocked');
    }

    // Clean up any existing auth state first
    await supabase.auth.signOut({ scope: 'global' });
    
    const { data, error } = await supabase.auth.signUp({
      email: emailValidation.sanitizedValue,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          role,
          phone_number: formData.phoneNumber,
          contact_name: formData.contactName || 'User',
          business_name: formData.businessName || 'Business',
          business_type: formData.businessType || role === 'seller' ? 'Retailer' : 'Wholesaler',
          address: formData.address || '',
          city: formData.city || '',
          postal_code: formData.postalCode || '',
          industry: formData.industry || ''
        }
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No user data returned');
    }

    // Ensure profile is created with complete data
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        email: data.user.email || email,
        phone_number: formData.phoneNumber,
        role,
        contact_name: formData.contactName || 'User',
        business_name: formData.businessName || 'Business',
        business_type: formData.businessType || (role === 'seller' ? 'Retailer' : 'Wholesaler'),
        address: formData.address || '',
        city: formData.city || '',
        postal_code: formData.postalCode || '',
        industry: formData.industry || '',
        years_in_business: formData.yearsInBusiness || '1-3 years'
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't throw error, just log it
    }

    return { user: data.user, session: data.session };
  } catch (error: any) {
    console.error('Enhanced sign up error:', error);
    throw error;
  }
};

export const enhancedSignOut = async () => {
  try {
    // Clear all auth-related storage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.error('Sign out error:', error);
      // Don't throw error, just log it
    }
    
    // Force page reload for clean state
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
    
  } catch (error) {
    console.error('Enhanced sign out error:', error);
    // Force page reload even if error
    window.location.href = '/';
  }
};
