
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { validateEmail, checkRateLimit, logSecurityEvent } from './security';

export const enhancedSignIn = async (email: string, password: string) => {
  try {
    if (!checkRateLimit(`login:${email}`, 5, 300000)) {
      throw new Error('Too many login attempts. Please try again later.');
    }

    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    console.log('Signing in with:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });
    
    if (error) {
      await logSecurityEvent('login_failed', { email, error: error.message });
      console.error('Auth signin error:', error);
      throw error;
    }

    await logSecurityEvent('login_success', { email });
    console.log('Signin successful, user data:', data);
    return data;
  } catch (error) {
    console.error('Enhanced sign in error:', error);
    throw error;
  }
};

export const enhancedSignUp = async (email: string, password: string, role: UserRole = 'wholesaler', formData?: any) => {
  try {
    if (!checkRateLimit(`signup:${email}`, 3, 3600000)) {
      throw new Error('Too many signup attempts. Please try again later.');
    }

    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    console.log('Signing up with email:', email, 'and role:', role);
    
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          role: role
        }
      }
    });
    
    if (error) {
      await logSecurityEvent('signup_failed', { email, error: error.message });
      console.error('Auth signup error:', error);
      throw error;
    }

    if (data.user && formData) {
      const profileUpdate: any = {
        role: role,
        phone_number: formData.phoneNumber,
        business_name: formData.businessName,
        contact_name: formData.contactName,
        business_type: formData.businessType,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode
      };

      if (formData.ntnNumber) profileUpdate.ntn_number = formData.ntnNumber;
      if (formData.strnNumber) profileUpdate.strn_number = formData.strnNumber;
      if (formData.industry) profileUpdate.industry = formData.industry;
      if (formData.yearsInBusiness) profileUpdate.years_in_business = formData.yearsInBusiness;

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', data.user.id);
      
      if (profileError) {
        console.error('Error updating profile with business info:', profileError);
      } else {
        console.log('Profile updated with business information');
      }
    } else if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: role })
        .eq('id', data.user.id);
      
      if (profileError) {
        console.error('Error updating profile role:', profileError);
      }
    }

    await logSecurityEvent('signup_success', { email, role });
    console.log('Signup successful, user data:', data);
    return data;
  } catch (error) {
    console.error('Enhanced sign up error:', error);
    throw error;
  }
};

export const secureChangeRole = async (newRole: UserRole) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const validRoles: UserRole[] = ['admin', 'wholesaler', 'seller', 'pending'];
    if (!validRoles.includes(newRole)) {
      throw new Error('Invalid role specified');
    }

    // Prevent admin role changes except for khizerfight@gmail.com
    if (newRole === 'admin') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();
      
      if (!profile || profile.email !== 'khizerfight@gmail.com') {
        throw new Error('Admin role can only be assigned to khizerfight@gmail.com');
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id)
      .select();
    
    if (error) {
      await logSecurityEvent('role_change_failed', { 
        user_id: user.id, 
        requested_role: newRole, 
        error: error.message 
      });
      console.error('Error changing role:', error);
      throw error;
    }
    
    await logSecurityEvent('role_change_success', { 
      user_id: user.id, 
      new_role: newRole 
    });
    
    return data[0];
  } catch (error) {
    console.error('Secure role change error:', error);
    throw error;
  }
};

export const enhancedSignOut = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await logSecurityEvent('logout', { user_id: user.id });
    }
    
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    
    window.location.href = '/';
    
    return true;
  } catch (error) {
    console.error('Enhanced sign out error:', error);
    throw error;
  }
};
