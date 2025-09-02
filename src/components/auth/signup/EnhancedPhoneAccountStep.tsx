import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Phone, Lock, Shield, ArrowRight } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './signupSchema';
import { UserRole } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { OTPVerification } from '../OTPVerification';
import { toast } from 'sonner';

interface EnhancedPhoneAccountStepProps {
  form: UseFormReturn<FormValues>;
  isLoading: boolean;
  selectedRole: UserRole;
  onPhoneBlocked: (blocked: boolean) => void;
  onVerified: () => void;
}

const EnhancedPhoneAccountStep: React.FC<EnhancedPhoneAccountStepProps> = ({
  form,
  isLoading,
  selectedRole,
  onPhoneBlocked,
  onVerified
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  
  const phoneNumber = form.watch('phoneNumber');
  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const strengthTexts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return { score, text: strengthTexts[score] || 'Very Weak' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSendOTP = async () => {
    // Validate form fields first
    const isValid = await form.trigger(['phoneNumber', 'password', 'confirmPassword']);
    
    if (!isValid) {
      toast.error('Please complete all fields correctly');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSendingOtp(true);
    
    try {
      // Check if phone is already registered
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone_number', phoneNumber.replace(/[^0-9]/g, ''))
        .maybeSingle();

      if (existingUser) {
        onPhoneBlocked(true);
        toast.error('This phone number is already registered');
        return;
      }

      // Send OTP
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: phoneNumber, type: 'signup' }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Verification code sent to your phone!');
        setShowOtpVerification(true);
        
        // In development, show the OTP
        if (data.otp) {
          toast.info(`Development mode: Your OTP is ${data.otp}`);
        }
      } else {
        toast.error(data.error || 'Failed to send verification code');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpVerified = () => {
    toast.success('Phone number verified successfully!');
    onVerified();
  };

  if (showOtpVerification) {
    return (
      <OTPVerification
        phoneNumber={phoneNumber}
        onVerified={handleOtpVerified}
        onBack={() => setShowOtpVerification(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-card-foreground mb-2 font-poppins">
          Secure Your Account
        </h3>
        <p className="text-sm text-muted-foreground font-poppins">
          Enter your phone number and create a password. We'll send you a verification code.
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center font-poppins">
                <Phone className="h-4 w-4 mr-2 text-primary" />
                Phone Number
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="03XX XXXXXXX"
                  type="tel"
                  disabled={isLoading}
                  className="font-poppins"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center font-poppins">
                <Lock className="h-4 w-4 mr-2 text-primary" />
                Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    disabled={isLoading}
                    className="font-poppins pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute inset-y-0 right-0 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              {password && (
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.score <= 1 ? 'bg-red-500' :
                          passwordStrength.score <= 2 ? 'bg-yellow-500' :
                          passwordStrength.score <= 3 ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-poppins">
                      {passwordStrength.text}
                    </span>
                  </div>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center font-poppins">
                <Lock className="h-4 w-4 mr-2 text-primary" />
                Confirm Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                    className="font-poppins pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute inset-y-0 right-0 px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              {confirmPassword && password && confirmPassword !== password && (
                <p className="text-sm text-red-600 font-poppins">
                  Passwords do not match
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Button
        onClick={handleSendOTP}
        disabled={isSendingOtp || !phoneNumber || !password || !confirmPassword || password !== confirmPassword}
        className="w-full"
        size="lg"
      >
        {isSendingOtp ? (
          'Sending verification code...'
        ) : (
          <>
            Send Verification Code
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2 font-poppins">Why verify your phone?</h4>
        <ul className="text-sm text-blue-700 space-y-1 font-poppins">
          <li>• Ensures your account security</li>
          <li>• Helps buyers and sellers connect safely</li>
          <li>• Enables order notifications via SMS</li>
          <li>• Required for business verification</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedPhoneAccountStep;