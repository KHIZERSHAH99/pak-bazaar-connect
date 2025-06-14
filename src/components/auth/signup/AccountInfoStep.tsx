
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { checkEmailExists } from '@/lib/validation';
import { useDebounce } from '@/hooks/useDebounce';

interface AccountInfoStepProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  selectedRole?: string;
}

const AccountInfoStep: React.FC<AccountInfoStepProps> = ({ form, isLoading, selectedRole = 'wholesaler' }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'checking' | 'available' | 'taken' | null>(null);
  
  const email = form.watch('email');
  const debouncedEmail = useDebounce(email, 500);

  React.useEffect(() => {
    const checkEmail = async () => {
      if (debouncedEmail && debouncedEmail.includes('@')) {
        setEmailStatus('checking');
        const exists = await checkEmailExists(debouncedEmail, selectedRole);
        setEmailStatus(exists ? 'taken' : 'available');
      } else {
        setEmailStatus(null);
      }
    };

    checkEmail();
  }, [debouncedEmail, selectedRole]);

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2 font-poppins">Account Information</h3>
        <p className="text-muted-foreground font-poppins text-sm">Create your {selectedRole} account credentials</p>
      </div>

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
                  disabled={isLoading} 
                  className="font-poppins pr-10 bg-background"
                  {...field} 
                />
                {emailStatus === 'checking' && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pakistani_green-700 dark:border-pakistani_green-400"></div>
                  </div>
                )}
                {emailStatus === 'available' && (
                  <CheckCircle className="absolute inset-y-0 right-0 flex items-center pr-3 h-4 w-4 text-green-500 mr-3 mt-3" />
                )}
                {emailStatus === 'taken' && (
                  <AlertCircle className="absolute inset-y-0 right-0 flex items-center pr-3 h-4 w-4 text-red-500 mr-3 mt-3" />
                )}
              </div>
            </FormControl>
            {emailStatus === 'taken' && (
              <p className="text-sm text-red-600 dark:text-red-400 font-poppins">
                This email is already registered as a {selectedRole}. Please try logging in or use a different email.
              </p>
            )}
            {emailStatus === 'available' && (
              <p className="text-sm text-green-600 dark:text-green-400 font-poppins">
                Email is available for {selectedRole} registration!
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
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </FormControl>
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
                  className="font-poppins pr-10 bg-background"
                  {...field} 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AccountInfoStep;
