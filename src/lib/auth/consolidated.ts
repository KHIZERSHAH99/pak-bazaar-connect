import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/types';
import { authSecurityManager } from '@/lib/security/enhanced-auth-security';
import { validateAndSanitizeInput, checkFieldUniqueness } from '@/lib/security/simple-validation';
import { 
  showAuthError, 
  validatePasswordStrength, 
  validatePakistaniPhone,
  parseAuthError 
} from './auth-errors';

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
      // Validate phone format first
      const phoneError = validatePakistaniPhone(normalizedInput);
      if (phoneError) {
        throw new Error(phoneError.message);
      }
      
      // Normalize Pakistani phone number
      const cleanPhone = normalizedInput.replace(/[^0-9]/g, '');
      let normalizedPhone = cleanPhone;
      
      if (cleanPhone.startsWith('923') && cleanPhone.length === 12) {
        normalizedPhone = '0' + cleanPhone.substring(2);
      } else if (cleanPhone.startsWith('3') && cleanPhone.length === 10) {
        normalizedPhone = '0' + cleanPhone;
      } else if (!cleanPhone.startsWith('0') && cleanPhone.length === 10) {
        normalizedPhone = '0' + cleanPhone;
      }
      
      console.log('Attempting login with phone:', normalizedPhone);
      
      // Try multiple email formats for phone-based accounts
      const emailFormats = [
        `phone-${normalizedPhone}@pakbazaarconnect.store`, // New format with prefix
        `${normalizedPhone}@pakbazaarconnect.store`, // Legacy format
        `${normalizedPhone}@phone.auth`,
        `${normalizedPhone}@temp-phone-auth.com`,
        `${normalizedPhone}@phone-auth.com`,
        `${normalizedPhone}@phone.auth.local`
      ];
      
      console.log('Checking for phone-based auth with possible emails:', emailFormats);
      
      // Use RPC function to find user by phone (avoids RLS issues)
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_user_by_phone', { phone_input: normalizedPhone });
      
      if (profileError) {
        console.error('Profile query error:', profileError);
        throw new Error('Failed to verify phone number');
      }
      
      const profile = profileData?.[0] || null;
      
      if (!profile) {
        console.log('No profile found for phone:', normalizedPhone);
        // Try with different email formats
        let authAttemptSuccessful = false;
        
        for (const emailFormat of emailFormats) {
          console.log('Attempting direct auth with email:', emailFormat);
          const { data, error } = await supabase.auth.signInWithPassword({
            email: emailFormat,
            password
          });
          
          if (!error && data.user) {
            console.log('Successfully authenticated with email format:', emailFormat);
            await authSecurityManager.recordAuthAttempt(emailOrPhone, true);
            return data;
          }
        }
        
        // If no format worked, use the primary format for the error
        authEmail = emailFormats[0];
      } else {
        console.log('Profile found:', { email: profile.user_email, role: profile.user_role });
        authEmail = profile.user_email;
      }
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
      const parsedError = parseAuthError(error);
      throw new Error(parsedError.message);
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
      // Use consistent email format for phone-based auth - prefix with "phone-" to ensure valid email
      authEmail = `phone-${phoneNumber}@pakbazaarconnect.store`;
      
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
          email: authEmail, // Include the actual email being used
          role,
          phone_number: phoneNumber || '',
          normalized_phone: phoneNumber || '',
          contact_name: businessData.contactName || 'User',
          business_name: businessData.businessName || 'Business',
          business_type: businessData.businessType || 'Retailer',
          address: businessData.address || '',
          city: businessData.city || '',
          postal_code: businessData.postalCode || '',
          industry: businessData.industry || '',
          auth_type: isPhone ? 'phone' : 'email', // Mark the auth type
          display_identifier: emailOrPhone // Store original input for display
        }
      }
    });
    
    if (error) {
      console.error('Registration error:', error);
      const parsedError = parseAuthError(error);
      throw new Error(parsedError.message);
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