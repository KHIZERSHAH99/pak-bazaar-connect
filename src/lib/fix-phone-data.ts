import { supabase } from '@/integrations/supabase/client';

// Utility function to fix existing phone data issues
export const fixPhoneUserData = async () => {
  try {
    console.log('🔧 Starting phone data cleanup...');
    
    // Get all profiles with phone numbers stored as emails
    const { data: phoneUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .or('email.like.%@temp-phone-auth.com,email.like.%@phone.auth.local');

    if (fetchError) {
      console.error('Error fetching phone users:', fetchError);
      return;
    }

    if (!phoneUsers || phoneUsers.length === 0) {
      console.log('✅ No phone data issues found');
      return;
    }

    console.log(`🔧 Found ${phoneUsers.length} users with phone data issues`);

    // Fix each user's data
    for (const user of phoneUsers) {
      let phoneNumber = '';
      
      if (user.email.includes('@temp-phone-auth.com')) {
        phoneNumber = user.email.replace('@temp-phone-auth.com', '');
      } else if (user.email.includes('@phone.auth.local')) {
        phoneNumber = user.email.replace('@phone.auth.local', '');
      }

      if (phoneNumber) {
        // Update the user's profile with correct phone data
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            phone_number: phoneNumber,
            normalized_phone: phoneNumber
          })
          .eq('id', user.id);

        if (updateError) {
          console.error(`Error updating user ${user.id}:`, updateError);
        } else {
          console.log(`✅ Fixed phone data for user: ${phoneNumber}`);
        }
      }
    }

    console.log('🎉 Phone data cleanup completed');
  } catch (error) {
    console.error('Phone data cleanup failed:', error);
  }
};

// Function to validate current phone data status
export const validatePhoneData = async () => {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, phone_number, normalized_phone')
      .limit(20);

    if (error) {
      console.error('Error validating phone data:', error);
      return;
    }

    console.log('📊 Current user data sample:');
    users?.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}, Phone: ${user.phone_number || 'N/A'}`);
    });
  } catch (error) {
    console.error('Phone data validation failed:', error);
  }
};