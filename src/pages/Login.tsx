
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogIn, User, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      await signIn(email, password);
      await checkAuthStatus();
      toast({
        title: 'Success',
        description: 'You have successfully logged in',
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials and try again');
      toast({
        title: 'Login failed',
        description: error.message || 'Please check your credentials and try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // For demo purposes, add quick login buttons
  const handleQuickLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await signIn(email, password);
      await checkAuthStatus();
      toast({
        title: 'Success',
        description: 'You have successfully logged in',
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Quick login error:', error);
      setError(error.message || 'Login failed. Please check your connection and try again');
      toast({
        title: 'Login failed',
        description: error.message || 'Please check your connection and try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pakistani_green-800 via-pakistani_green-700 to-pakistani_green-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="grid-login" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-login)" />
        </svg>
      </div>
      
      <nav className="relative z-10 w-full px-6 py-6">
        <Link to="/" className="flex items-center">
          <div className="bg-white rounded-xl p-2 shadow-md">
            <span className="text-pakistani_green-700 text-2xl font-bold">PBC</span>
          </div>
          <div className="ml-3">
            <span className="text-xl font-bold text-white tracking-tight">Pak Bazaar Connect</span>
          </div>
        </Link>
      </nav>
      
      <div className="container flex-grow mx-auto px-4 py-8 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-pakistani_green-100 p-4 rounded-full">
                  <LogIn className="h-8 w-8 text-pakistani_green-700" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center text-red-600 text-sm">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pakistani_green-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pakistani_green-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-pakistani_green-700 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:bg-pakistani_green-800 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-pakistani_green-700 hover:underline font-medium">
                  Sign Up
                </Link>
              </p>
            </div>

            {/* Quick login for demo purposes */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">Demo Accounts</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('admin@test.com', 'password')}
                  disabled={isLoading}
                  className="border-pakistani_green-700 text-pakistani_green-700 hover:bg-pakistani_green-50"
                >
                  Admin
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('wholesaler1@test.com', 'password')}
                  disabled={isLoading}
                  className="border-pakistani_green-700 text-pakistani_green-700 hover:bg-pakistani_green-50"
                >
                  Wholesaler
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('seller1@test.com', 'password')}
                  disabled={isLoading}
                  className="border-pakistani_green-700 text-pakistani_green-700 hover:bg-pakistani_green-50"
                >
                  Seller
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Password for all demo accounts: "password"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
