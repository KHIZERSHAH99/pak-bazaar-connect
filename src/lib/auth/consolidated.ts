import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/types';
import { authSecurityManager } from '@/lib/security/enhanced-auth-security';
import { validateAndSanitizeInput, checkFieldUniqueness } from '@/lib/security/simple-validation';

// Consolidated authentication with security
export const authenticateUser = async (emailOrPhone: string, password: string) => {
  try {
    console.log('🔐 Starting consolidated authentication');
    
    // Security validation
    const securityCheck = await authSecurityManager.enforceSecureLogin(emailOrPhone, password);
    if (!securityCheck.allowed) {
      throw new Error(securityCheck.message || 'Sign in blocked for security reasons');
    }
    
    // Determine input type
    const isEmail = emailOrPhone.includes('@');
    const isPhone = /^[\d\s\+\-\(\)]+$/.test(emailOrPhone.trim());
    
    let normalizedInput = emailOrPhone.trim();
    let authEmail = '';
    
    if (isPhone) {
      // Normalize Pakistani phone number
      const cleanPhone = normalizedInput.replace(/[^0-9]/g, '');
      let normalizedPhone = cleanPhone;
      
      if (cleanPhone.startsWith('923') && cleanPhone.length === 12) {
        normalizedPhone = '0' + cleanPhone.substring(2);
      } else if (cleanPhone.startsWith('3') && cleanPhone.length === 10) {
        normalizedPhone = '0' + cleanPhone;
      }
      
      // Find user by phone
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, id, role')
        .or(`normalized_phone.eq.${normalizedPhone},phone_number.eq.${normalizedPhone}`)
        .single();
      
      if (!profile) {
        throw new Error('No account found with this phone number');
      }
      
      authEmail = profile.email;
    } else if (isEmail) {
      authEmail = normalizedInput.toLowerCase();
    } else {
      throw new Error('Please enter a valid email or phone number');
    }
    
    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password
    });
    
    if (error) {
      console.error('Authentication error:', error);
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid credentials');
      }
      throw new Error('Authentication failed');
    }
    
    // Record successful login
    await authSecurityManager.recordAuthAttempt(emailOrPhone, true);
    
    return data;
  } catch (error: any) {
    console.error('Consolidated auth error:', error);
    await authSecurityManager.recordAuthAttempt(emailOrPhone, false);
    throw error;
  }
};

export const registerUser = async (
  emailOrPhone: string,
  password: string,
  role: UserRole,
  businessData: Record<string, any>
) => {
  try {
    console.log('🔐 Starting consolidated registration');
    
    // Validate password security
    const passwordValidation = await authSecurityManager.validatePasswordSecurity(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors[0] || 'Password does not meet requirements');
    }
    
    // Determine input type and validate
    const isEmail = emailOrPhone.includes('@');
    const isPhone = /^[\d\s\+\-\(\)]+$/.test(emailOrPhone.trim());
    
    let authEmail = '';
    let phoneNumber = '';
    
    if (isPhone) {
      // Validate and normalize phone
      const phoneValidation = await validateAndSanitizeInput(emailOrPhone, 'phone');
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.errors[0] || 'Invalid phone number');
      }
      
      phoneNumber = phoneValidation.sanitizedValue;
      authEmail = `${phoneNumber}@phone.auth.local`;
      
      // Check phone uniqueness
      const phoneExists = await checkFieldUniqueness('phone', phoneNumber);
      if (phoneExists) {
        throw new Error('An account with this phone number already exists');
      }
    } else if (isEmail) {
      // Validate email
      const emailValidation = await validateAndSanitizeInput(emailOrPhone, 'email');
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.errors[0] || 'Invalid email format');
      }
      
      authEmail = emailValidation.sanitizedValue;
      
      // Check email uniqueness
      const emailExists = await checkFieldUniqueness('email', authEmail);
      if (emailExists) {
        throw new Error('An account with this email already exists');
      }
    } else {
      throw new Error('Please enter a valid email or phone number');
    }
    
    // Create account
    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          role,
          phone_number: phoneNumber,
          normalized_phone: phoneNumber,
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
      console.error('Registration error:', error);
      if (error.message.includes('User already registered')) {
        throw new Error('An account with this information already exists');
      }
      throw new Error('Registration failed');
    }
    
    // Ensure profile is created
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: authEmail,
          phone_number: phoneNumber,
          normalized_phone: phoneNumber,
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
  } catch (error: any) {
    console.error('Consolidated registration error:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    // Clear all auth state
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) throw error;
    
    // Force page reload for clean state
    window.location.href = '/';
  } catch (error) {
    console.error('Sign out error:', error);
    // Force reload even if error
    window.location.href = '/';
  }
};