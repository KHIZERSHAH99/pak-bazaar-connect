
import { supabase } from '@/integrations/supabase/client';

export const cleanupOldScreenshots = async () => {
  try {
    const { error } = await supabase.rpc('delete_old_payment_screenshots');
    
    if (error) {
      console.error('Error cleaning up screenshots:', error);
      return false;
    }
    
    console.log('Successfully cleaned up old payment screenshots');
    return true;
  } catch (error) {
    console.error('Screenshot cleanup failed:', error);
    return false;
  }
};

// Schedule cleanup to run periodically (call this from your app initialization)
export const scheduleScreenshotCleanup = () => {
  // Run cleanup every 24 hours
  const intervalId = setInterval(cleanupOldScreenshots, 24 * 60 * 60 * 1000);
  
  // Also run cleanup on app start
  cleanupOldScreenshots();
  
  return intervalId;
};
