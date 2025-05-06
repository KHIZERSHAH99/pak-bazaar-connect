
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

// File upload function
export const uploadImage = async (bucket: string, fileName: string, file: File) => {
  const user = await getCurrentUser();
  
  if (!user) throw new Error('User not authenticated');
  
  const filePath = `${user.id}/${fileName}`;
  
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);
  
  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};
