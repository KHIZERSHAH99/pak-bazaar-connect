import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Lock, Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authenticateUser } from '@/lib/auth/consolidated';
import { validatePakistaniPhone, normalizePakistaniPhone } from '@/lib/auth/phone-utils';
import { authSecurityManager } from '@/lib/security/enhanced-auth-security';
import { showAuthError, parseAuthError, validatePasswordStrength } from '@/lib/auth/auth-errors';

const PakistaniLoginForm: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountLocked, setAccountLocked] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState('');
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check account lockout when phone number changes
  useEffect(() => {
    const checkLockout = async () => {
      if (phoneNumber && validatePakistaniPhone(normalizePakistaniPhone(phoneNumber))) {
        const lockoutStatus = await authSecurityManager.checkAccountLockout(normalizePakistaniPhone(phoneNumber));
        setAccountLocked(lockoutStatus.isLocked);
        setLockoutMessage(`Account locked. Try again in ${Math.ceil(lockoutStatus.remainingTime / 60000)} minutes.`);
      } else {
        setAccountLocked(false);
        setLockoutMessage('');
      }
    };

    const timeoutId = setTimeout(checkLockout, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [phoneNumber]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    
    // Auto-format Pakistani phone number
    if (value.length <= 11) {
      if (value.startsWith('03')) {
        const formatted = value.length > 4 ? 
          `${value.substring(0, 4)}-${value.substring(4)}` : 
          value;
        setPhoneNumber(formatted);
      } else {
        setPhoneNumber(value);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      
      if (!validatePakistaniPhone(cleanPhone)) {
        throw new Error('Please enter a valid Pakistani mobile number (03XX-XXXXXXX)');
      }

      if (accountLocked) {
        throw new Error(lockoutMessage || 'Account is temporarily locked');
      }

      console.log('🔐 Attempting consolidated authentication:', cleanPhone);
      
      const result = await authenticateUser(cleanPhone, password);
      
      if (result.user) {
        toast({
          title: 'خوش آمدید! Welcome back!',
          description: 'You have successfully logged in.',
        });

        const redirectTo = searchParams.get('redirect') || '/dashboard';
        console.log('🔄 Redirecting to:', redirectTo);
        navigate(redirectTo, { replace: true });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Use the new error handling system
      showAuthError(error, 'login');
      
      // Show signup prompt for certain errors
      if (error.message?.includes('No account') || error.message?.includes('not found')) {
        setTimeout(() => {
          toast({
            title: 'Need an Account?',
            description: 'Create a new account to get started with our B2B marketplace.',
            action: (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/signup')}
                className="ml-2"
              >
                Sign Up
              </Button>
            ),
          });
        }, 1500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary font-poppins flex items-center justify-center gap-2">
          <Phone className="h-6 w-6" />
          پاکستانی لاگ ان
        </CardTitle>
        <CardDescription className="font-poppins">
          Enter your Pakistani mobile number and password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center font-poppins">
              <Phone className="h-4 w-4 mr-2 text-primary" />
              Pakistani Mobile Number
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="03XX-XXXXXXX"
              value={phoneNumber}
              onChange={handlePhoneChange}
              disabled={isLoading}
              className={`font-poppins ${accountLocked ? 'border-destructive' : ''}`}
              maxLength={12} // 03XX-XXXXXXX format
              required
            />
            {accountLocked && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <Shield className="h-4 w-4" />
                {lockoutMessage}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center font-poppins">
              <Lock className="h-4 w-4 mr-2 text-primary" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || accountLocked}
                className="font-poppins pr-10"
                required
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
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 font-poppins"
            disabled={isLoading || accountLocked}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground font-poppins">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-primary hover:text-primary/90 font-medium"
            >
              Create Pakistani account
            </Link>
          </p>
        </div>

        {/* Security notice */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span className="font-poppins">
              Secure Pakistani phone-only authentication
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PakistaniLoginForm;