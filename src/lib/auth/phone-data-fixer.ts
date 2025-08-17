import { supabase } from '@/integrations/supabase/client';
import { normalizePakistaniPhone } from './phone-utils';

export const manualPhoneDataFix = async () => {
  try {
    console.log('🔧 Starting manual phone data fix...');
    
    // Get all users that might have phone data issues
    const { data: users, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .or('email.like.%@temp-phone-auth.com,email.like.%@phone.auth.local,phone_number.is.null');

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return;
    }

    console.log(`Found ${users?.length || 0} users to potentially fix`);

    if (!users || users.length === 0) {
      console.log('✅ No users need fixing');
      return;
    }

    for (const user of users) {
      let needsUpdate = false;
      const updates: any = {};

      // Extract phone from fake email addresses
      if (user.email.includes('@temp-phone-auth.com')) {
        const phoneFromEmail = user.email.replace('@temp-phone-auth.com', '');
        if (phoneFromEmail && phoneFromEmail !== user.phone_number) {
          updates.phone_number = phoneFromEmail;
          updates.normalized_phone = normalizePakistaniPhone(phoneFromEmail);
          needsUpdate = true;
          console.log(`📱 Extracting phone from email for user ${user.id}: ${phoneFromEmail}`);
        }
      } else if (user.email.includes('@phone.auth.local')) {
        const phoneFromEmail = user.email.replace('@phone.auth.local', '');
        if (phoneFromEmail && phoneFromEmail !== user.phone_number) {
          updates.phone_number = phoneFromEmail;
          updates.normalized_phone = normalizePakistaniPhone(phoneFromEmail);
          needsUpdate = true;
          console.log(`📱 Extracting phone from email for user ${user.id}: ${phoneFromEmail}`);
        }
      }

      // Fix normalization issues
      if (user.phone_number && (!user.normalized_phone || user.normalized_phone !== normalizePakistaniPhone(user.phone_number))) {
        updates.normalized_phone = normalizePakistaniPhone(user.phone_number);
        needsUpdate = true;
        console.log(`🔄 Normalizing phone for user ${user.id}: ${user.phone_number} → ${updates.normalized_phone}`);
      }

      // Apply updates if needed
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);

        if (updateError) {
          console.error(`❌ Failed to update user ${user.id}:`, updateError);
        } else {
          console.log(`✅ Updated user ${user.id} successfully`);
        }
      }
    }

    console.log('🎉 Manual phone data fix completed');
  } catch (error) {
    console.error('❌ Manual phone data fix failed:', error);
  }
};

export const validateCurrentPhoneData = async () => {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, phone_number, normalized_phone, role')
      .limit(50);

    if (error) {
      console.error('Error validating phone data:', error);
      return;
    }

    console.log('📊 Current phone data status:');
    
    let totalUsers = 0;
    let phoneUsers = 0;
    let fakeEmailUsers = 0;
    let inconsistentUsers = 0;

    users?.forEach((user, index) => {
      totalUsers++;
      
      const hasPhone = !!user.phone_number;
      const hasFakeEmail = user.email.includes('@temp-phone-auth.com') || user.email.includes('@phone.auth.local');
      const hasInconsistentPhone = hasPhone && (!user.normalized_phone || user.normalized_phone !== normalizePakistaniPhone(user.phone_number));
      
      if (hasPhone) phoneUsers++;
      if (hasFakeEmail) fakeEmailUsers++;
      if (hasInconsistentPhone) inconsistentUsers++;

      console.log(`${index + 1}. ${user.email} | Phone: ${user.phone_number || 'N/A'} | Normalized: ${user.normalized_phone || 'N/A'} | Role: ${user.role}`);
      
      if (hasFakeEmail) console.log(`   ⚠️  Has fake email address`);
      if (hasInconsistentPhone) console.log(`   ⚠️  Phone normalization inconsistent`);
    });

    console.log('\n📈 Summary:');
    console.log(`Total users: ${totalUsers}`);
    console.log(`Users with phone numbers: ${phoneUsers}`);
    console.log(`Users with fake emails: ${fakeEmailUsers}`);
    console.log(`Users with inconsistent phone data: ${inconsistentUsers}`);
    
    const health = inconsistentUsers === 0 && fakeEmailUsers <= phoneUsers ? 'HEALTHY' : 
                 inconsistentUsers < 5 ? 'MINOR ISSUES' : 'NEEDS ATTENTION';
    console.log(`Data health: ${health}`);
    
  } catch (error) {
    console.error('Phone data validation failed:', error);
  }
};