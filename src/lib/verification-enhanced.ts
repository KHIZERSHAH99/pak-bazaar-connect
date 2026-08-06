
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/security/audit-enhanced';

// Enhanced verification with better file handling and audit logging
export const uploadVerificationDocumentsEnhanced = async (cnicFile: File, selfieFile: File) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Validate file sizes (100KB limit for each)
  if (cnicFile.size > 102400) {
    throw new Error('CNIC image must be less than 100KB');
  }
  if (selfieFile.size > 102400) {
    throw new Error('Selfie image must be less than 100KB');
  }

  // Validate file types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(cnicFile.type)) {
    throw new Error('CNIC must be a JPEG, PNG, or WebP image');
  }
  if (!allowedTypes.includes(selfieFile.type)) {
    throw new Error('Selfie must be a JPEG, PNG, or WebP image');
  }

  try {
    // Upload CNIC
    const cnicExt = cnicFile.name.split('.').pop();
    const cnicFileName = `${user.id}/cnic_${Date.now()}.${cnicExt}`;
    
    const { data: cnicUpload, error: cnicError } = await supabase.storage
      .from('verification-documents')
      .upload(cnicFileName, cnicFile, { upsert: true });

    if (cnicError) {
      console.error('Error uploading CNIC:', cnicError);
      throw new Error(`Failed to upload CNIC: ${cnicError.message}`);
    }

    // Upload selfie
    const selfieExt = selfieFile.name.split('.').pop();
    const selfieFileName = `${user.id}/selfie_${Date.now()}.${selfieExt}`;
    
    const { data: selfieUpload, error: selfieError } = await supabase.storage
      .from('verification-documents')
      .upload(selfieFileName, selfieFile, { upsert: true });

    if (selfieError) {
      console.error('Error uploading selfie:', selfieError);
      throw new Error(`Failed to upload selfie: ${selfieError.message}`);
    }

    // Update profile with document paths
    const { data, error } = await supabase
      .from('profiles')
      .update({
        cnic_image: cnicUpload.path,
        selfie_image: selfieUpload.path,
        verification_status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile with documents:', error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    // Log audit event
    await logAuditEvent('verification_documents_uploaded', 'profiles', user.id, null, {
      cnic_path: cnicUpload.path,
      selfie_path: selfieUpload.path,
      verification_status: 'pending'
    });

    return data;
  } catch (error) {
    console.error('Verification upload error:', error);
    throw error;
  }
};

// Enhanced verification approval with audit logging
export const approveWholesalerVerificationEnhanced = async (profileId: string, notes?: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Check if current user is admin
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (adminProfile?.role !== 'admin') {
    throw new Error('Only admins can approve verifications');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      verification_status: 'approved',
      verification_notes: notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', profileId)
    .select()
    .single();

  if (error) {
    console.error('Error approving verification:', error);
    throw new Error(`Failed to approve verification: ${error.message}`);
  }

  // Log audit event
  await logAuditEvent('verification_approved', 'profiles', profileId, 
    { verification_status: 'pending' }, 
    { verification_status: 'approved', approved_by: user.id, notes }
  );

  return data;
};

// Enhanced verification rejection with audit logging
export const rejectWholesalerVerificationEnhanced = async (profileId: string, notes: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  if (!notes.trim()) {
    throw new Error('Rejection reason is required');
  }

  // Check if current user is admin
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (adminProfile?.role !== 'admin') {
    throw new Error('Only admins can reject verifications');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      verification_status: 'rejected',
      verification_notes: notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', profileId)
    .select()
    .single();

  if (error) {
    console.error('Error rejecting verification:', error);
    throw new Error(`Failed to reject verification: ${error.message}`);
  }

  // Log audit event
  await logAuditEvent('verification_rejected', 'profiles', profileId, 
    { verification_status: 'pending' }, 
    { verification_status: 'rejected', rejected_by: user.id, notes }
  );

  return data;
};

// Get verification document URLs (for admin review)
export const getVerificationDocumentUrls = async (profileId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Check if current user is admin or the profile owner
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';
  const isOwner = user.id === profileId;

  if (!isAdmin && !isOwner) {
    throw new Error('Unauthorized access to verification documents');
  }

  const { data: targetProfile, error } = await supabase
    .from('profiles')
    .select('cnic_image, selfie_image, verification_status')
    .eq('id', profileId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  if (!targetProfile.cnic_image || !targetProfile.selfie_image) {
    return { cnicUrl: null, selfieUrl: null, status: targetProfile.verification_status };
  }

  // Get signed URLs for the documents
  const { data: cnicUrl } = supabase.storage
    .from('verification-documents')
    .getPublicUrl(targetProfile.cnic_image);

  const { data: selfieUrl } = supabase.storage
    .from('verification-documents')
    .getPublicUrl(targetProfile.selfie_image);

  return {
    cnicUrl: cnicUrl.publicUrl,
    selfieUrl: selfieUrl.publicUrl,
    status: targetProfile.verification_status
  };
};
