import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextFixed';
const FixedLoginForm: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();
  const {
    signIn
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log('🔐 Attempting login with phone:', phoneNumber);
      const result = await signIn(phoneNumber, password);
      if (result.error) {
        throw new Error(result.error);
      }
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.'
      });

      // Navigate to redirect URL or dashboard
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      console.log('🔄 Redirecting to:', redirectTo);
      navigate(redirectTo, {
        replace: true
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid phone number or password',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Demo login removed for security in production

  return <Card className="w-full max-w-md mx-auto shadow-lg">
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
            <Input id="phoneNumber" type="tel" placeholder="03XX XXXXXXX" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} disabled={isLoading} className="font-poppins" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center font-poppins">
              <Lock className="h-4 w-4 mr-2 text-primary" />
              Password
            </Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} className="font-poppins pr-10" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3" disabled={isLoading}>
                {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 font-poppins" disabled={isLoading}>
            {isLoading ? <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing In...
              </> : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground font-poppins">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary/90 font-medium">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Demo accounts only in development */}
        {process.env.NODE_ENV === 'development'}
      </CardContent>
    </Card>;
};
export default FixedLoginForm;