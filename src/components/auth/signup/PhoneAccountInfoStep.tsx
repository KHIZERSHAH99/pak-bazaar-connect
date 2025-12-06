
import React, { useEffect, useState, useRef } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Phone, Lock, CheckCircle, XCircle } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './signupSchema';
import { UserRole } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { validatePakistaniPhone } from '@/lib/auth/phone-utils';
import HCaptchaWidget, { HCaptchaRef } from '../HCaptcha';

interface PhoneAccountInfoStepProps {
  form: UseFormReturn<FormValues>;
  isLoading: boolean;
  selectedRole: UserRole;
  onPhoneBlocked: (blocked: boolean) => void;
  onCaptchaVerify?: (token: string) => void;
  captchaRef?: React.RefObject<HCaptchaRef>;
}

const PhoneAccountInfoStep: React.FC<PhoneAccountInfoStepProps> = ({
  form,
  isLoading,
  selectedRole,
  onPhoneBlocked,
  onCaptchaVerify,
  captchaRef
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneCheckState, setPhoneCheckState] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  
  const phoneNumber = form.watch('phoneNumber');
  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');

  // Check if phone number is available
  useEffect(() => {
    const checkPhoneAvailability = async () => {
      if (!phoneNumber || phoneNumber.length < 10) {
        setPhoneCheckState('idle');
        onPhoneBlocked(false);
        return;
      }

      if (!validatePakistaniPhone(phoneNumber)) {
        setPhoneCheckState('idle');
        onPhoneBlocked(false);
        return;
      }

      setPhoneCheckState('checking');

      try {
        const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone_number', cleanPhone)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Phone check error:', error);
          setPhoneCheckState('idle');
          onPhoneBlocked(false);
          return;
        }

        if (data) {
          setPhoneCheckState('taken');
          onPhoneBlocked(true);
        } else {
          setPhoneCheckState('available');
          onPhoneBlocked(false);
        }
      } catch (error) {
        console.error('Phone availability check failed:', error);
        setPhoneCheckState('idle');
        onPhoneBlocked(false);
      }
    };

    const timeoutId = setTimeout(checkPhoneAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [phoneNumber, onPhoneBlocked]);

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

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-2 font-poppins">
          Create Your Account
        </h3>
        <p className="text-sm text-muted-foreground font-poppins">
          Enter your phone number and create a secure password for your {selectedRole} account
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center font-poppins">
                <Phone className="h-4 w-4 mr-2 text-pakistani_green-600" />
                Phone Number
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    placeholder="03XX XXXXXXX"
                    type="tel"
                    disabled={isLoading}
                    className="font-poppins pr-10"
                  />
                  {phoneCheckState === 'checking' && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-pakistani_green-600 border-t-transparent"></div>
                    </div>
                  )}
                  {phoneCheckState === 'available' && (
                    <CheckCircle className="absolute inset-y-0 right-0 flex items-center pr-3 h-4 w-4 text-green-600" />
                  )}
                  {phoneCheckState === 'taken' && (
                    <XCircle className="absolute inset-y-0 right-0 flex items-center pr-3 h-4 w-4 text-red-600" />
                  )}
                </div>
              </FormControl>
              {phoneCheckState === 'taken' && (
                <p className="text-sm text-red-600 font-poppins">
                  This phone number is already registered. Please use a different number.
                </p>
              )}
              {phoneCheckState === 'available' && (
                <p className="text-sm text-green-600 font-poppins">
                  Phone number is available!
                </p>
              )}
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
                <Lock className="h-4 w-4 mr-2 text-pakistani_green-600" />
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
                  <p className="text-xs text-muted-foreground font-poppins">
                    Use 8+ characters with a mix of letters, numbers & symbols
                  </p>
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
                <Lock className="h-4 w-4 mr-2 text-pakistani_green-600" />
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2 font-poppins">Account Security</h4>
        <ul className="text-sm text-blue-700 space-y-1 font-poppins">
          <li>• Your phone number will be used for account verification</li>
          <li>• Keep your password secure and don't share it with others</li>
          <li>• You can change your password anytime from your profile</li>
        </ul>
      </div>

      {/* hCaptcha Widget */}
      <HCaptchaWidget
        ref={captchaRef}
        onVerify={onCaptchaVerify}
        className="flex flex-col items-center pt-4"
      />
    </div>
  );
};

export default PhoneAccountInfoStep;
