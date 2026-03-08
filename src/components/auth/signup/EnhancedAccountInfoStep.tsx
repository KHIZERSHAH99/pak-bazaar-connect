
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Phone, Lock, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { checkPhoneExists } from '@/lib/validation-enhanced';
import { useDebounce } from '@/hooks/useDebounce';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnhancedAccountInfoStepProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  selectedRole?: string;
  onPhoneBlocked?: (blocked: boolean) => void;
}

const EnhancedAccountInfoStep: React.FC<EnhancedAccountInfoStepProps> = ({ 
  form, 
  isLoading, 
  selectedRole = 'wholesaler',
  onPhoneBlocked 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneStatus, setPhoneStatus] = useState<'checking' | 'available' | 'taken' | 'blocked' | 'error' | null>(null);
  
  const phoneNumber = form.watch('phoneNumber');
  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');
  const debouncedPhone = useDebounce(phoneNumber, 800);

  React.useEffect(() => {
    const checkPhone = async () => {
      if (!debouncedPhone || debouncedPhone.length < 10) {
        setPhoneStatus(null);
        onPhoneBlocked?.(false);
        return;
      }

      try {
        setPhoneStatus('checking');
        const exists = await checkPhoneExists(debouncedPhone);
        
        if (exists) {
          setPhoneStatus('blocked');
          onPhoneBlocked?.(true);
          form.setError('phoneNumber', {
            type: 'manual',
            message: 'This phone number is already registered. Please use a different phone number.'
          });
        } else {
          setPhoneStatus('available');
          onPhoneBlocked?.(false);
          form.clearErrors('phoneNumber');
        }
      } catch (error) {
        console.error('Phone check error:', error);
        setPhoneStatus('error');
        onPhoneBlocked?.(false);
        // Don't show error to user, just continue
      }
    };

    checkPhone();
  }, [debouncedPhone, form, onPhoneBlocked]);

  // Password strength validation - simplified
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, message: 'Enter a password' };
    
    let strength = 0;
    let message = 'Too short';
    
    if (password.length >= 8) {
      strength = 2;
      message = 'Acceptable';
    }
    
    if (password.length >= 12) {
      strength = 3;
      message = 'Good';
    }
    
    if (password.length >= 16) {
      strength = 4;
      message = 'Strong';
    }
    
    return { strength, message };
  };

  const passwordStrength = getPasswordStrength(password || '');
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2 font-poppins">Account Information</h3>
        <p className="text-muted-foreground font-poppins text-sm">Create your {selectedRole} account credentials</p>
      </div>

      {phoneStatus === 'blocked' && (
        <Alert variant="destructive" className="mb-4">
          <X className="h-4 w-4" />
          <AlertDescription className="font-poppins">
            This phone number is already registered. Please use a different phone number to continue.
          </AlertDescription>
        </Alert>
      )}

      {phoneStatus === 'error' && (
        <Alert className="mb-4 border-yellow-200 bg-yellow-50 text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-poppins">
            Unable to verify phone number availability. You can continue, but registration may fail if phone number is already in use.
          </AlertDescription>
        </Alert>
      )}

      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center text-foreground font-poppins">
              <Phone className="h-4 w-4 mr-1 text-primary" />
              Phone Number
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input 
                  type="tel" 
                  placeholder="03xxxxxxxxx" 
                  disabled={isLoading || phoneStatus === 'blocked'} 
                  className={`font-poppins pr-10 bg-background ${
                    phoneStatus === 'blocked' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 
                    phoneStatus === 'available' ? 'border-green-500' : ''
                  }`}
                  {...field} 
                />
                {phoneStatus === 'checking' && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
                {phoneStatus === 'available' && (
                  <CheckCircle className="absolute inset-y-0 right-0 flex items-center pr-3 h-4 w-4 text-green-500 mr-3 mt-3" />
                )}
                {phoneStatus === 'blocked' && (
                  <X className="absolute inset-y-0 right-0 flex items-center pr-3 h-4 w-4 text-red-500 mr-3 mt-3" />
                )}
              </div>
            </FormControl>
            {phoneStatus === 'available' && (
              <p className="text-sm text-green-600 dark:text-green-400 font-poppins">
                ✓ Phone number is available for {selectedRole} registration!
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
            <FormLabel className="flex items-center text-foreground font-poppins">
              <Lock className="h-4 w-4 mr-1 text-primary" />
              Password
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Create a strong password" 
                  disabled={isLoading} 
                  className="font-poppins pr-10 bg-background"
                  {...field} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </FormControl>
            {password && (
              <div className="text-xs font-poppins">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 w-full rounded ${
                        i <= passwordStrength.strength
                          ? passwordStrength.strength < 2
                            ? 'bg-red-500'
                            : passwordStrength.strength === 2
                            ? 'bg-yellow-500'
                            : passwordStrength.strength === 3
                            ? 'bg-blue-500'
                            : 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`${
                  passwordStrength.strength < 2 ? 'text-red-600' :
                  passwordStrength.strength === 2 ? 'text-yellow-600' :
                  passwordStrength.strength === 3 ? 'text-blue-600' : 'text-green-600'
                }`}>
                  {passwordStrength.message} (minimum 8 characters required)
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
            <FormLabel className="flex items-center text-foreground font-poppins">
              <Lock className="h-4 w-4 mr-1 text-pakistani_green-700 dark:text-pakistani_green-400" />
              Confirm Password
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Confirm your password" 
                  disabled={isLoading} 
                  className={`font-poppins pr-10 bg-background ${
                    confirmPassword && passwordsMatch ? 'border-green-500' :
                    confirmPassword && !passwordsMatch ? 'border-red-500' : ''
                  }`}
                  {...field} 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </FormControl>
            {confirmPassword && (
              <p className={`text-xs font-poppins ${
                passwordsMatch ? 'text-green-600' : 'text-red-600'
              }`}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default EnhancedAccountInfoStep;
