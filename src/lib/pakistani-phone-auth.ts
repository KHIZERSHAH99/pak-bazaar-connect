import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/types';

// Pakistani phone number validation
export const validatePakistaniPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  // Valid Pakistani mobile: 03XX-XXXXXXX (11 digits starting with 03)
  return /^03[0-9]{9}$/.test(cleanPhone);
};

// Format phone number for display
export const formatPakistaniPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 11 && cleanPhone.startsWith('03')) {
    return `${cleanPhone.substring(0, 4)}-${cleanPhone.substring(4)}`;
  }
  return phone;
};

// Normalize phone number to standard format
export const normalizePakistaniPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  
  if (cleanPhone.startsWith('923') && cleanPhone.length === 12) {
    // From +92 3XX XXXXXXX to 03XX XXXXXXX
    return '0' + cleanPhone.substring(2);
  } else if (cleanPhone.startsWith('3') && cleanPhone.length === 10) {
    // From 3XX XXXXXXX to 03XX XXXXXXX
    return '0' + cleanPhone;
  } else if (cleanPhone.startsWith('03') && cleanPhone.length === 11) {
    // Already in correct format
    return cleanPhone;
  }
  
  return cleanPhone;
};

// Request OTP for phone verification
export const requestOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string; otp?: string }> => {
  try {
    console.log('📱 Requesting OTP for:', phoneNumber);
    
    const normalizedPhone = normalizePakistaniPhone(phoneNumber);
    
    if (!validatePakistaniPhone(normalizedPhone)) {
      throw new Error('Please enter a valid Pakistani mobile number (03XX-XXXXXXX)');
    }

    // Check rate limiting
    const { data: canRequest, error: rateLimitError } = await supabase.rpc('can_request_otp', {
      user_phone: normalizedPhone
    });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      throw new Error('Unable to send OTP. Please try again.');
    }

    if (!canRequest) {
      throw new Error('Too many OTP requests. Please wait before requesting again.');
    }

    // Generate OTP using database function
    const { data: otp, error: otpError } = await supabase.rpc('generate_otp');
    
    if (otpError || !otp) {
      console.error('OTP generation error:', otpError);
      throw new Error('Failed to generate OTP');
    }

    // Store OTP in user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        otp_code: otp,
        otp_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        otp_attempts: 0,
        last_otp_request: new Date().toISOString()
      })
      .eq('normalized_phone', normalizedPhone);

    if (updateError) {
      console.error('OTP storage error:', updateError);
      throw new Error('Failed to send OTP');
    }

    console.log('✅ OTP generated and stored successfully');
    
    // In production, send OTP via SMS service (Jazz/Telenor API)
    // For development, return OTP in response
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname.includes('lovable.app');
    
    return {
      success: true,
      message: `OTP sent to ${formatPakistaniPhone(normalizedPhone)}`,
      ...(isDevelopment && { otp }) // Only include OTP in development
    };

  } catch (error: any) {
    console.error('Request OTP error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send OTP'
    };
  }
};

// Verify OTP
export const verifyOTP = async (phoneNumber: string, otp: string) => {
  try {
    console.log('🔐 Verifying OTP for:', phoneNumber);
    
    const normalizedPhone = normalizePakistaniPhone(phoneNumber);
    
    if (!validatePakistaniPhone(normalizedPhone)) {
      throw new Error('Invalid phone number format');
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      throw new Error('OTP must be 6 digits');
    }

    // Verify OTP using database function
    const { data: result, error } = await supabase.rpc('verify_otp', {
      user_phone: normalizedPhone,
      provided_otp: otp
    });

    if (error) {
      console.error('OTP verification error:', error);
      throw new Error('OTP verification failed');
    }

    const verificationResult = result as { success: boolean; error?: string; message?: string };
    
    if (!verificationResult.success) {
      throw new Error(verificationResult.error || 'Invalid OTP');
    }

    console.log('✅ OTP verified successfully');
    return { success: true, message: verificationResult.message || 'Phone verified successfully' };

  } catch (error: any) {
    console.error('Verify OTP error:', error);
    throw error;
  }
};

// Check account lockout status
export const checkAccountLockout = async (phoneNumber: string) => {
  try {
    const normalizedPhone = normalizePakistaniPhone(phoneNumber);
    
    const { data: result, error } = await supabase.rpc('check_account_lockout', {
      user_phone: normalizedPhone
    });

    if (error) {
      console.error('Lockout check error:', error);
      return { locked: false };
    }

    return result as { locked: boolean; message?: string };
  } catch (error) {
    console.error('Check lockout error:', error);
    return { locked: false };
  }
};

// Sign up with Pakistani phone number and OTP verification
export const phoneSignUp = async (
  phoneNumber: string,
  password: string,
  role: UserRole,
  businessData: Record<string, any>
) => {
  try {
    console.log('🔐 Starting Pakistani phone sign up');
    
    const normalizedPhone = normalizePakistaniPhone(phoneNumber);
    
    if (!validatePakistaniPhone(normalizedPhone)) {
      throw new Error('Please enter a valid Pakistani mobile number (03XX-XXXXXXX)');
    }

    // Check if phone already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id, phone_verified')
      .eq('normalized_phone', normalizedPhone)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Phone check error:', checkError);
      throw new Error('Registration failed');
    }

    if (existingUser) {
      throw new Error('An account with this phone number already exists. Please sign in instead.');
    }

    // Create a unique email for Supabase auth - prefix with "phone-" to ensure valid email format
    const uniqueEmail = `phone-${normalizedPhone}@pakbazaarconnect.store`;

    // Create account in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: uniqueEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          email: uniqueEmail, // Add the actual email being used
          role: role,
          phone_number: normalizedPhone,
          normalized_phone: normalizedPhone,
          contact_name: businessData.contactName || 'User',
          business_name: businessData.businessName || 'Business',
          business_type: businessData.businessType || role,
          address: businessData.address || '',
          city: businessData.city || '',
          postal_code: businessData.postalCode || '',
          industry: businessData.industry || '',
          phone_verified: false, // Will be verified via OTP
          auth_type: 'phone', // Mark this as a phone-based account
          display_identifier: formatPakistaniPhone(normalizedPhone) // For display purposes
        }
      }
    });

    if (error) {
      console.error('Supabase signup error:', error);
      
      // Check for duplicate user error - this is the actual error message from Supabase
      if (error.message.includes('User already registered') || 
          error.message.includes('duplicate key value') ||
          error.message.includes('already exists')) {
        throw new Error('An account with this phone number already exists. Please sign in instead.');
      } else if (error.message.includes('Password should be at least')) {
        throw new Error('Password must be at least 6 characters long');
      } else if (error.message.includes('Invalid email')) {
        // This means the phone format created an invalid email - shouldn't happen but handle it
        throw new Error('Invalid phone number format. Please check and try again.');
      } else {
        // Pass through the actual error message for better debugging
        throw new Error(error.message || 'Registration failed. Please try again.');
      }
    }

    console.log('✅ Pakistani phone signup successful');
    return data;

  } catch (error: any) {
    console.error('Pakistani phone signup error:', error);
    throw error;
  }
};

// Sign in with Pakistani phone number
export const phoneSignIn = async (phoneNumber: string, password: string) => {
  try {
    console.log('🔐 Starting Pakistani phone sign in with secure function');
    console.log('📱 Input phone number:', phoneNumber);
    
    const normalizedPhone = normalizePakistaniPhone(phoneNumber);
    console.log('📱 Normalized phone:', normalizedPhone);
    
    if (!validatePakistaniPhone(normalizedPhone)) {
      throw new Error('Please enter a valid Pakistani mobile number (03XX-XXXXXXX)');
    }

    // Check account lockout
    const lockoutStatus = await checkAccountLockout(normalizedPhone);
    if (lockoutStatus.locked) {
      throw new Error(lockoutStatus.message || 'Account temporarily locked');
    }

    console.log('🔍 Using secure database function for user lookup...');
    
    // Use the secure database function to find user
    const { data: lookupResult, error: lookupError } = await supabase
      .rpc('authenticate_user_by_phone', { user_phone: phoneNumber });

    if (lookupError) {
      console.error('❌ Database function error:', lookupError);
      throw new Error('Authentication service error. Please try again.');
    }

    console.log('📋 Lookup result:', lookupResult);

    // Type the lookup result
    const authResult = lookupResult as { 
      success: boolean; 
      error?: string; 
      email?: string; 
      user_id?: string; 
    };

    if (!authResult.success) {
      console.log('❌ User not found:', authResult.error);
      throw new Error(authResult.error || 'No account found with this phone number. Please check the number or create a new account.');
    }

    const { email, user_id } = authResult;
    console.log('✅ User found - Email:', email, 'ID:', user_id);

    console.log('🔑 Attempting Supabase authentication...');

    // Sign in using the associated email
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      
      // Log failed attempt with detailed error
      try {
        await supabase.rpc('log_audit_event', {
          p_user_id: user_id,
          p_event_type: 'login_failed',
          p_new_values: JSON.stringify({ 
            phone: normalizedPhone, 
            email: email,
            error_code: error.message,
            reason: 'invalid_credentials' 
          })
        });
      } catch (auditError) {
        console.error('Audit log error:', auditError);
      }

      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid phone number or password');
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Please verify your account before signing in');
      } else if (error.message.includes('Too many requests')) {
        throw new Error('Too many login attempts. Please wait before trying again.');
      } else {
        throw new Error('Sign in failed. Please try again.');
      }
    }

    // Enhanced success logging
    try {
      await supabase.rpc('log_audit_event', {
        p_user_id: user_id,
        p_event_type: 'login_success',
        p_new_values: JSON.stringify({ 
          phone: normalizedPhone,
          email: email
        })
      });
    } catch (auditError) {
      console.error('Audit log error:', auditError);
    }

    console.log('✅ Pakistani phone sign in successful');
    console.log('👤 User ID:', user_id);
    console.log('📧 User email:', email);
    
    return data;

  } catch (error: any) {
    console.error('🚨 Pakistani phone sign in error:', error);
    console.error('🚨 Error stack:', error.stack);
    throw error;
  }
};

// Add helper function for debugging phone numbers
export const debugPhoneNumbers = async () => {
  try {
    console.log('🔍 Debug: Fetching all phone numbers...');
    
    const { data: phones, error } = await supabase.rpc('get_available_phones');
    
    if (error) {
      console.error('Debug phones error:', error);
      return [];
    }
    
    console.log('📞 Available phone numbers:', phones);
    return phones;
  } catch (error) {
    console.error('Debug phones error:', error);
    return [];
  }
};