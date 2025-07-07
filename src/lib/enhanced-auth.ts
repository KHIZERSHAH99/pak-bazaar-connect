
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from './types';

// Enhanced authentication with better error handling and phone support
export const enhancedSignIn = async (emailOrPhone: string, password: string) => {
  try {
    // Clean up any existing auth state first
    await supabase.auth.signOut({ scope: 'global' });
    
    // Determine if input is email or phone
    const isEmail = emailOrPhone.includes('@');
    const loginEmail = isEmail ? emailOrPhone : `${emailOrPhone.replace(/[^0-9]/g, '')}@temp-phone-auth.com`;
    
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
    // Clean up any existing auth state first
    await supabase.auth.signOut({ scope: 'global' });
    
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
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
