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
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Invalid or expired verification code' };
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
