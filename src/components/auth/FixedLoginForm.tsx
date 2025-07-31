
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Lock, Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextFixed';
import { validateLoginForm } from '@/lib/security/form-validation';
import { rateLimiter, RATE_LIMITS, getClientIdentifier } from '@/lib/security/rateLimit';
import { validateAndSanitizeInput } from '@/lib/security/validation';

const FixedLoginForm: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Client-side rate limiting check
      const clientId = getClientIdentifier();
      const rateCheck = await rateLimiter.checkRateLimit(
        `login_${clientId}`, 
        RATE_LIMITS.LOGIN.maxRequests, 
        RATE_LIMITS.LOGIN.windowMs
      );

      if (!rateCheck.allowed) {
        const waitMinutes = Math.ceil((rateCheck.resetTime - Date.now()) / 60000);
        throw new Error(`Too many login attempts (${rateCheck.remaining} remaining). Please wait ${waitMinutes} minutes before trying again. This security measure protects accounts from unauthorized access.`);
      }

      // Validate and sanitize form data
      const validation = await validateLoginForm({
        phoneNumber: phoneNumber,
        password: password
      });

      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors).flat();
        throw new Error(errorMessages[0] || 'Invalid input provided');
      }

      console.log('🔐 Attempting login with phone:', phoneNumber);
      
      // Use sanitized data for login
      const sanitizedPhone = validation.sanitizedData?.phoneNumber || phoneNumber;
      const result = await signIn(sanitizedPhone, password);
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });

      // Navigate to redirect URL or dashboard
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      console.log('🔄 Redirecting to:', redirectTo);
      
      // Force full page reload for security
      window.location.href = redirectTo;
    } catch (error: any) {
      console.error('Login error:', error);
      
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid phone number or password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoPhone: string) => {
    setPhoneNumber(demoPhone);
    setPassword('demo123');
    
    // Small delay to show the form filled, then auto-submit
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    }, 500);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary font-poppins">
          Welcome Back
        </CardTitle>
        <CardDescription className="font-poppins">
          Enter your phone number and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center font-poppins">
              <Phone className="h-4 w-4 mr-2 text-primary" />
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="03XX XXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
              className="font-poppins"
              required
            />
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
                disabled={isLoading}
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
            disabled={isLoading}
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
              Sign up here
            </Link>
          </p>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center mb-2">
            <Shield className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-800 font-poppins">Why Login Limits?</span>
          </div>
          <p className="text-xs text-blue-700 font-poppins mb-2">
            We limit login attempts (10 per 15 minutes) to protect your account from unauthorized access and brute force attacks.
          </p>
          <p className="text-xs text-blue-600 font-poppins">
            • Demo accounts are exempt from these limits<br/>
            • Limits reset automatically after 15 minutes<br/>
            • This keeps your business data secure
          </p>
        </div>

        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-3 font-poppins">Demo Accounts:</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="text-sm text-green-700 font-poppins">
                <p><strong>Wholesaler:</strong> 03001234567</p>
                <p className="text-xs text-green-600">Password: demo123</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleDemoLogin('03001234567')}
                disabled={isLoading}
                className="text-xs"
              >
                Use
              </Button>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="text-sm text-green-700 font-poppins">
                <p><strong>Seller:</strong> 03004567890</p>
                <p className="text-xs text-green-600">Password: demo123</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleDemoLogin('03004567890')}
                disabled={isLoading}
                className="text-xs"
              >
                Use
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FixedLoginForm;
