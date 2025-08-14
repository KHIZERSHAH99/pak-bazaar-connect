
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signIn } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, Mail, Key, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const SecureLoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }
      
      await signIn(email, password);
      
      toast({
        title: 'Success',
        description: 'You have successfully logged in'
      });
      
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      setAttempts(prev => prev + 1);
      
      let errorMessage = 'Login failed. Please check your credentials and try again';
      
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before logging in.';
        } else if (error.message.includes('rate limit') || error.message.includes('Too many')) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-lg overflow-hidden">
      <CardContent className="pt-6">
        {error && (
          <div className="mb-6 p-3 bg-red-50 rounded-lg flex items-center text-red-600 text-sm border border-red-100">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {attempts >= 3 && (
          <div className="mb-6 p-3 bg-yellow-50 rounded-lg flex items-center text-yellow-700 text-sm border border-yellow-200">
            <Shield className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>Multiple failed attempts detected. Please ensure you're using the correct credentials.</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center font-poppins">
              <Mail className="h-4 w-4 mr-1 text-pakistani_green-700" />
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 bg-white border border-gray-300 rounded-md focus-visible:ring-pakistani_green-500 font-poppins"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 flex items-center font-poppins">
              <Key className="h-4 w-4 mr-1 text-pakistani_green-700" />
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-3 bg-white border border-gray-300 rounded-md focus-visible:ring-pakistani_green-500 font-poppins"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-pakistani_green-700 hover:bg-pakistani_green-800 text-white font-medium py-3 px-4 rounded-md shadow-sm transition-colors font-poppins"
            disabled={isLoading || attempts >= 5}
          >
            {isLoading ? 'Logging In...' : 'Log In'}
          </Button>

          {attempts >= 5 && (
            <p className="text-sm text-red-600 text-center font-poppins">
              Account temporarily locked due to multiple failed attempts. Please try again later.
            </p>
          )}
        </form>
      </CardContent>
      
      <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-center p-4">
        <p className="text-sm text-gray-600 font-poppins">
          Don't have an account?{' '}
          <Link to="/signup" className="text-pakistani_green-700 hover:text-pakistani_green-800 font-medium">
            Sign Up Here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SecureLoginForm;
