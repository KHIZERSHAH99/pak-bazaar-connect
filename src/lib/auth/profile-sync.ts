import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/types';

// Ensure profile exists and is synchronized with auth user
export const ensureProfileSync = async (userId: string, email: string, metadata?: any) => {
  try {
    console.log('🔄 Ensuring profile sync for user:', userId);
    
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching profile:', fetchError);
      return false;
    }
    
    // If profile doesn't exist, create it
    if (!existingProfile) {
      console.log('Creating new profile for user:', userId);
      
      const profileData = {
        id: userId,
        email: email,
        role: metadata?.role || 'seller',
        phone_number: metadata?.phone_number || metadata?.normalized_phone || null,
        normalized_phone: metadata?.normalized_phone || metadata?.phone_number || null,
        contact_name: metadata?.contact_name || 'User',
        business_name: metadata?.business_name || 'Business',
        business_type: metadata?.business_type || 'Retailer',
        address: metadata?.address || '',
        city: metadata?.city || '',
        postal_code: metadata?.postal_code || '',
        industry: metadata?.industry || '',
        years_in_business: metadata?.years_in_business || '1-3 years',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(profileData);
      
      if (insertError) {
        console.error('Error creating profile:', insertError);
        return false;
      }
      
      console.log('✅ Profile created successfully');
      return true;
    } else {
      console.log('Profile already exists for user:', userId);
      
      // Update profile if needed
      if (!existingProfile.email || !existingProfile.role) {
        const updateData: any = {};
        
        if (!existingProfile.email) updateData.email = email;
        if (!existingProfile.role) updateData.role = metadata?.role || 'seller';
        if (!existingProfile.phone_number && metadata?.phone_number) {
          updateData.phone_number = metadata.phone_number;
          updateData.normalized_phone = metadata.normalized_phone || metadata.phone_number;
        }
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (updateError) {
          console.error('Error updating profile:', updateError);
          return false;
        }
        
        console.log('✅ Profile updated successfully');
      }
      
      return true;
    }
  } catch (error) {
    console.error('Profile sync error:', error);
    return false;
  }
};

// Check and fix profile data integrity
export const fixProfileDataIntegrity = async () => {
  try {
    console.log('🔧 Checking profile data integrity...');
    
    // Get all auth users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError || !users) {
      console.error('Cannot list users:', usersError);
      return;
    }
    
    for (const user of users) {
      await ensureProfileSync(user.id, user.email || '', user.user_metadata);
    }
    
    console.log('✅ Profile data integrity check complete');
  } catch (error) {
    console.error('Profile integrity check error:', error);
  }
};