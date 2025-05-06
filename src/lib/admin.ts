
import { supabase } from '@/integrations/supabase/client';

export const getPendingRoleRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('role_requests')
      .select('*, profiles:user_id(email)')
      .eq('status', 'pending');
    
    if (error) {
      console.error('Error fetching pending role requests:', error);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error('Error in getPendingRoleRequests:', err);
    return [];
  }
};

export const approveRoleRequest = async (requestId: string, approve = true) => {
  if (!approve) {
    // Just update the request status to rejected
    const { error: updateRequestError } = await supabase
      .from('role_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);
    
    if (updateRequestError) {
      console.error('Error rejecting role request:', updateRequestError);
      throw updateRequestError;
    }
    
    return true;
  }

  // For approval, get the request to get the user id and requested role
  const { data: request, error: requestError } = await supabase
    .from('role_requests')
    .select('*')
    .eq('id', requestId)
    .single();
  
  if (requestError || !request) {
    console.error('Error fetching role request:', requestError);
    throw requestError;
  }
  
  // Update the request status to approved
  const { error: updateRequestError } = await supabase
    .from('role_requests')
    .update({ status: 'approved' })
    .eq('id', requestId);
  
  if (updateRequestError) {
    console.error('Error updating role request:', updateRequestError);
    throw updateRequestError;
  }
  
  // Update the user's role in their profile
  const { error: updateProfileError } = await supabase
    .from('profiles')
    .update({ role: request.requested_role })
    .eq('id', request.user_id);
  
  if (updateProfileError) {
    console.error('Error updating user profile:', updateProfileError);
    throw updateProfileError;
  }
  
  return true;
};
