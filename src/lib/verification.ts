
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

// Upload CNIC and selfie for wholesaler verification
export const uploadVerificationDocuments = async (cnicFile: File, selfieFile: File) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Upload CNIC
  const cnicExt = cnicFile.name.split('.').pop();
  const cnicFileName = `${user.id}/cnic.${cnicExt}`;
  
  const { data: cnicUpload, error: cnicError } = await supabase.storage
    .from('verification-documents')
    .upload(cnicFileName, cnicFile, { upsert: true });

  if (cnicError) {
    console.error('Error uploading CNIC:', cnicError);
    throw cnicError;
  }

  // Upload selfie
  const selfieExt = selfieFile.name.split('.').pop();
  const selfieFileName = `${user.id}/selfie.${selfieExt}`;
  
  const { data: selfieUpload, error: selfieError } = await supabase.storage
    .from('verification-documents')
    .upload(selfieFileName, selfieFile, { upsert: true });

  if (selfieError) {
    console.error('Error uploading selfie:', selfieError);
    throw selfieError;
  }

  // Update profile with document paths
  const { data, error } = await supabase
    .from('profiles')
    .update({
      cnic_image: cnicUpload.path,
      selfie_image: selfieUpload.path,
      verification_status: 'pending'
    })
    .eq('id', user.id)
    .select();

  if (error) {
    console.error('Error updating profile with documents:', error);
    throw error;
  }

  return data[0];
};

// Get pending verification requests (admin only)
export const getPendingVerifications = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('verification_status', 'pending')
    .eq('role', 'wholesaler')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending verifications:', error);
    return [];
  }

  return data || [];
};

// Approve wholesaler verification (admin only)
export const approveWholesalerVerification = async (profileId: string, notes?: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      verification_status: 'approved',
      verification_notes: notes
    })
    .eq('id', profileId)
    .select();

  if (error) {
    console.error('Error approving verification:', error);
    throw error;
  }

  return data[0];
};

// Reject wholesaler verification (admin only)
export const rejectWholesalerVerification = async (profileId: string, notes: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      verification_status: 'rejected',
      verification_notes: notes
    })
    .eq('id', profileId)
    .select();

  if (error) {
    console.error('Error rejecting verification:', error);
    throw error;
  }

  return data[0];
};

// Check if user needs verification
export const checkVerificationStatus = async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('verification_status, role, is_suspended')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error checking verification status:', error);
    return null;
  }

  return data;
};
