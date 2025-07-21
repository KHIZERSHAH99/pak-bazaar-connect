
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/types';

// Phone number validation
export const validatePhoneNumber = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('92')) {
    return `+${cleanPhone}`;
  }
  if (cleanPhone.startsWith('03')) {
    return `+92${cleanPhone.substring(1)}`;
  }
  return `+92${cleanPhone}`;
};

// Enhanced phone-based authentication with better error handling
export const phoneSignIn = async (phoneNumber: string, password: string) => {
  try {
    console.log('🔐 Starting enhanced phone sign in process');
    
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    
    if (!validatePhoneNumber(cleanPhone)) {
      throw new Error('Please enter a valid phone number');
    }

    // Strategy 1: Try to find profile with this phone number first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, phone_number, role')
      .eq('phone_number', cleanPhone)
      .maybeSingle();

    if (profileError) {
      console.error('Profile lookup error:', profileError);
      throw new Error('Authentication failed');
    }

    let loginEmail = '';
    
    if (profile) {
      // Found profile, use the associated email
      loginEmail = profile.email;
    } else {
      // Strategy 2: Try phone-based email formats as fallback
      const phoneEmailFormats = [
        `${cleanPhone}@phone.auth.local`,
        `${cleanPhone}@temp-phone-auth.com`
      ];
      
      let foundProfile = null;
      for (const emailFormat of phoneEmailFormats) {
        const { data: fallbackProfile } = await supabase
          .from('profiles')
          .select('id, email, phone_number, role')
          .eq('email', emailFormat)
          .maybeSingle();
          
        if (fallbackProfile) {
          foundProfile = fallbackProfile;
          loginEmail = emailFormat;
          break;
        }
      }
      
      if (!foundProfile) {
        throw new Error('No account found with this phone number');
      }
    }

    // Sign in using the determined email
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid phone number or password');
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Please verify your account before signing in');
      } else {
        throw new Error('Sign in failed. Please try again.');
      }
    }

    console.log('✅ Enhanced phone sign in successful');
    return data;
  } catch (error) {
    console.error('Phone sign in error:', error);
    throw error;
  }
};

export const phoneSignUp = async (
  phoneNumber: string, 
  password: string, 
  role: UserRole,
  businessData: Record<string, any>
) => {
  try {
    console.log('🔐 Starting enhanced phone sign up process');
    
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    
    if (!validatePhoneNumber(cleanPhone)) {
      throw new Error('Please enter a valid phone number');
    }

    // Check if phone number already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', cleanPhone)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Phone check error:', checkError);
      throw new Error('Registration failed');
    }

    if (existingProfile) {
      throw new Error('An account with this phone number already exists');
    }

    // Create a unique email for Supabase auth using phone number
    const uniqueEmail = `${cleanPhone}@phone.auth.local`;

    const { data, error } = await supabase.auth.signUp({
      email: uniqueEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          role: role,
          phone_number: cleanPhone,
          contact_name: businessData.contactName || 'User',
          business_name: businessData.businessName || 'Business',
          business_type: businessData.businessType || (role === 'seller' ? 'Retailer' : 'Wholesaler'),
          address: businessData.address || '',
          city: businessData.city || '',
          postal_code: businessData.postalCode || '',
          industry: businessData.industry || ''
        }
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      
      if (error.message.includes('User already registered')) {
        throw new Error('An account with this information already exists');
      } else if (error.message.includes('Password should be at least')) {
        throw new Error('Password must be at least 6 characters long');
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }

    console.log('✅ Enhanced phone sign up successful');
    return data;
  } catch (error) {
    console.error('Phone sign up error:', error);
    throw error;
  }
};
