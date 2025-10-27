import { supabase } from '@/integrations/supabase/client';

export interface OTPVerificationResult {
  success: boolean;
  error?: string;
}

/**
 * Send OTP code to user's email
 */
export async function sendOTPCode(userId: string, email: string, name?: string): Promise<OTPVerificationResult> {
  try {
    const { data, error } = await supabase.functions.invoke('send-otp-email', {
      body: { userId, email, name }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return { success: false, error: error.message || 'Failed to send verification code' };
  }
}

/**
 * Verify OTP code
 */
export async function verifyOTPCode(userId: string, otp: string): Promise<OTPVerificationResult> {
  try {
    const { data, error } = await supabase.rpc('verify_email_otp', {
      p_user_id: userId,
      p_otp: otp
    });

    if (error) {
      // Extract attempts info from error message if available
      if (error.message.includes('Too many failed attempts')) {
        return { success: false, error: 'Too many failed attempts. Please request a new verification code.' };
      }
      if (error.message.includes('expired')) {
        return { success: false, error: 'Verification code expired. Please request a new one.' };
      }
      return { success: false, error: error.message };
    }

    if (!data) {
      // Get remaining attempts
      const { data: profile } = await supabase
        .from('profiles')
        .select('otp_attempts')
        .eq('id', userId)
        .single();
      
      const attempts = profile?.otp_attempts || 0;
      const remaining = Math.max(0, 5 - attempts);
      
      return { 
        success: false, 
        error: `Invalid verification code. ${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining.` 
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return { success: false, error: error.message || 'Verification failed' };
  }
}

/**
 * Resend OTP code
 */
export async function resendOTPCode(userId: string, email: string): Promise<OTPVerificationResult> {
  return sendOTPCode(userId, email);
}
