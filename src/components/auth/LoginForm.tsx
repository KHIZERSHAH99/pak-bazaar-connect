
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { enhancedSignIn } from '@/lib/auth-enhanced';

const LoginForm: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Clean phone number
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      
      if (cleanPhone.length < 10) {
        throw new Error('Please enter a valid phone number');
      }

      // Convert phone to temp email format
      const tempEmail = `${cleanPhone}@temp-phone-auth.com`;
      
      await enhancedSignIn(tempEmail, password);

      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });

      // Force navigation with page reload for clean state
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);

    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid phone number or password. Please try again.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please verify your account before logging in.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.';
      }

      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-pakistani_green-700 font-poppins">
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
              <Phone className="h-4 w-4 mr-2 text-pakistani_green-600" />
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
              <Lock className="h-4 w-4 mr-2 text-pakistani_green-600" />
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
            className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
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
              className="text-pakistani_green-600 hover:text-pakistani_green-700 font-medium"
            >
              Sign up here
            </Link>
          </p>
        </div>

        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-2 font-poppins">Demo Accounts:</h4>
          <div className="text-sm text-green-700 space-y-1 font-poppins">
            <p><strong>Wholesaler:</strong> 03001234567 | password: demo123</p>
            <p><strong>Seller:</strong> 03004567890 | password: demo123</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
