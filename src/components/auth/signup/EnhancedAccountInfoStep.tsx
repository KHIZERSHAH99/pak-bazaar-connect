
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { checkEmailExistsGlobal } from '@/lib/validation-enhanced';
import { useDebounce } from '@/hooks/useDebounce';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnhancedAccountInfoStepProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  selectedRole?: string;
  onEmailBlocked?: (blocked: boolean) => void;
}

const EnhancedAccountInfoStep: React.FC<EnhancedAccountInfoStepProps> = ({ 
  form, 
  isLoading, 
  selectedRole = 'wholesaler',
  onEmailBlocked 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'checking' | 'available' | 'taken' | 'blocked' | 'error' | null>(null);
  
  const email = form.watch('email');
  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');
  const debouncedEmail = useDebounce(email, 800);

  React.useEffect(() => {
    const checkEmail = async () => {
      if (!debouncedEmail || !debouncedEmail.includes('@') || debouncedEmail.length < 5) {
        setEmailStatus(null);
        onEmailBlocked?.(false);
        return;
      }

      try {
        setEmailStatus('checking');
        const exists = await checkEmailExistsGlobal(debouncedEmail);
        
        if (exists) {
          setEmailStatus('blocked');
          onEmailBlocked?.(true);
          form.setError('email', {
            type: 'manual',
            message: 'This email is already registered. Please use a different email address.'
          });
        } else {
          setEmailStatus('available');
          onEmailBlocked?.(false);
          form.clearErrors('email');
        }
      } catch (error) {
        console.error('Email check error:', error);
        setEmailStatus('error');
        onEmailBlocked?.(false);
        // Don't show error to user, just continue
      }
    };

    checkEmail();
  }, [debouncedEmail, form, onEmailBlocked]);

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, message: '' };
    
    let strength = 0;
    let issues = [];
    
    if (password.length >= 8) strength++;
    else issues.push('at least 8 characters');
    
    if (/[A-Z]/.test(password)) strength++;
    else issues.push('uppercase letter');
    
    if (/[a-z]/.test(password)) strength++;
    else issues.push('lowercase letter');
    
    if (/\d/.test(password)) strength++;
    else issues.push('number');
    
    return {
      strength,
      message: issues.length > 0 ? `Missing: ${issues.join(', ')}` : 'Strong password'
    };
  };

  const passwordStrength = getPasswordStrength(password || '');
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2 font-poppins">Account Information</h3>
        <p className="text-muted-foreground font-poppins text-sm">Create your {selectedRole} account credentials</p>
      </div>

      {emailStatus === 'blocked' && (
        <Alert variant="destructive" className="mb-4">
          <X className="h-4 w-4" />
          <AlertDescription className="font-poppins">
            This email is already registered. Please use a different email address to continue.
          </AlertDescription>
        </Alert>
      )}

      {emailStatus === 'error' && (
        <Alert className="mb-4 border-yellow-200 bg-yellow-50 text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-poppins">
            Unable to verify email availability. You can continue, but registration may fail if email is already in use.
          </AlertDescription>
        </Alert>
      )}

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center text-foreground font-poppins">
              <Mail className="h-4 w-4 mr-1 text-pakistani_green-700 dark:text-pakistani_green-400" />
              Email Address
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input 
                  type="email" 
                  placeholder="Enter your email address" 
                  disabled={isLoading || emailStatus === 'blocked'} 
                  className={`font-poppins pr-10 bg-background ${
                    emailStatus === 'blocked' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 
                    emailStatus === 'available' ? 'border-green-500' : ''
                  }`}
                  {...field} 
                />
                {emailStatus === 'checking' && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Loader2 className="h-4 w-4 animate-spin text-pakistani_green-700 dark:text-pakistani_green-400" />
                  </div>
                )}
                {emailStatus === 'available' && (
                  <CheckCircle className="absolute inset-y-0 right-0 flex items-center pr-3 h-4 w-4 text-green-500 mr-3 mt-3" />
                )}
                {emailStatus === 'blocked' && (
                  <X className="absolute inset-y-0 right-0 flex items-center pr-3 h-4 w-4 text-red-500 mr-3 mt-3" />
                )}
              </div>
            </FormControl>
            {emailStatus === 'available' && (
              <p className="text-sm text-green-600 dark:text-green-400 font-poppins">
                ✓ Email is available for {selectedRole} registration!
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
              <Lock className="h-4 w-4 mr-1 text-pakistani_green-700 dark:text-pakistani_green-400" />
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
                          ? passwordStrength.strength <= 2
                            ? 'bg-red-500'
                            : passwordStrength.strength === 3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`${
                  passwordStrength.strength <= 2 ? 'text-red-600' :
                  passwordStrength.strength === 3 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {passwordStrength.message}
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
