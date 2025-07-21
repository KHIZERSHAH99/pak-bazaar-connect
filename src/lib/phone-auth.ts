
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

// Enhanced phone-based authentication
export const phoneSignIn = async (phoneNumber: string, password: string) => {
  try {
    console.log('🔐 Starting phone sign in process');
    
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    
    if (!validatePhoneNumber(cleanPhone)) {
      throw new Error('Please enter a valid phone number');
    }

    // Check if profile exists with this phone number
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, phone_number, role')
      .eq('phone_number', cleanPhone)
      .maybeSingle();

    if (profileError) {
      console.error('Profile lookup error:', profileError);
      throw new Error('Authentication failed');
    }

    if (!profile) {
      throw new Error('No account found with this phone number');
    }

    // Sign in using the email associated with the phone number
    const { data, error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      throw new Error('Invalid phone number or password');
    }

    console.log('✅ Phone sign in successful');
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
    console.log('🔐 Starting phone sign up process');
    
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
          ...businessData
        }
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      throw new Error('Registration failed. Please try again.');
    }

    console.log('✅ Phone sign up successful');
    return data;
  } catch (error) {
    console.error('Phone sign up error:', error);
    throw error;
  }
};
