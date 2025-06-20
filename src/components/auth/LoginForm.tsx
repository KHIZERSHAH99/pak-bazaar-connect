
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { enhancedSignIn, cleanupAuthState } from '@/lib/auth-enhanced';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, Mail, Key, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLoginForm from './AdminLoginForm';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { checkAuthStatus } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    if (attempts >= 5) {
      setError('Too many failed attempts. Please wait before trying again.');
      return;
    }
    
    setIsLoading(true);

    try {
      // Clean up any old state before attempting sign in
      cleanupAuthState();
      
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }
      
      await enhancedSignIn(email, password);
      await checkAuthStatus();

      toast({
        title: 'Login Successful',
        description: 'Welcome back! Redirecting to dashboard...'
      });

      // Force navigation with page reload for clean state
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
      
    } catch (error: any) {
      console.error('Login error:', error);
      setAttempts(prev => prev + 1);
      
      let errorMessage = 'Login failed. Please check your credentials and try again';

      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before logging in.';
        } else if (error.message.includes('rate limit') || error.message.includes('Too many')) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);

      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showAdminLogin) {
    return (
      <Card className="border-none shadow-lg overflow-hidden bg-card dark:bg-card">
        <CardContent className="pt-6">
          <AdminLoginForm onBackToRegular={() => setShowAdminLogin(false)} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg overflow-hidden bg-card dark:bg-card">
      <CardContent className="pt-6">
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center text-red-600 dark:text-red-300 text-sm border border-red-100 dark:border-red-800">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {attempts >= 3 && attempts < 5 && (
          <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center text-yellow-700 dark:text-yellow-300 text-sm border border-yellow-200 dark:border-yellow-800">
            <Shield className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>Multiple failed attempts detected. Please ensure you're using the correct credentials.</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground flex items-center font-poppins">
              <Mail className="h-4 w-4 mr-1 text-pakistani_green-700 dark:text-pakistani_green-300" />
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 bg-background dark:bg-background border border-input dark:border-input rounded-md focus-visible:ring-pakistani_green-500 font-poppins"
              disabled={isLoading || attempts >= 5}
              autoComplete="email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-foreground flex items-center font-poppins">
              <Key className="h-4 w-4 mr-1 text-pakistani_green-700 dark:text-pakistani_green-300" />
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-3 bg-background dark:bg-background border border-input dark:border-input rounded-md focus-visible:ring-pakistani_green-500 font-poppins"
              disabled={isLoading || attempts >= 5}
              autoComplete="current-password"
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-pakistani_green-700 hover:bg-pakistani_green-800 dark:bg-pakistani_green-700 dark:hover:bg-pakistani_green-600 text-white font-medium py-3 px-4 rounded-md shadow-sm transition-colors font-poppins"
            disabled={isLoading || attempts >= 5}
          >
            {isLoading ? 'Logging In...' : 'Log In'}
          </Button>

          {attempts >= 5 && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center font-poppins">
              Account temporarily locked due to multiple failed attempts. Please try again later.
            </p>
          )}
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAdminLogin(true)}
            className="inline-flex items-center text-xs text-muted-foreground hover:text-pakistani_green-600 dark:hover:text-pakistani_green-300 transition-colors font-poppins"
            disabled={isLoading}
          >
            <Shield className="h-3 w-3 mr-1" />
            Admin Access
          </button>
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-border bg-muted/30 dark:bg-muted/50 flex justify-center p-4">
        <p className="text-sm text-muted-foreground font-poppins">
          Don't have an account?{' '}
          <Link to="/signup" className="text-pakistani_green-700 dark:text-pakistani_green-300 hover:text-pakistani_green-800 dark:hover:text-pakistani_green-200 font-medium">
            Sign Up Here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
