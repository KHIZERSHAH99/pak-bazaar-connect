
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both email and password',
        variant: 'destructive',
      });
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
      await signIn(email, password);
      await checkAuthStatus();
      toast({
        title: 'Success',
        description: 'You have successfully logged in',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Please check your credentials and try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pakistani-green-800 via-blue-600 to-yellow-400 relative overflow-hidden">
      {/* Abstract shapes in the background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-yellow-300/30 to-orange-500/30 blur-xl"></div>
        <div className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-gradient-to-br from-blue-300/30 to-purple-500/30 blur-xl"></div>
        <div className="absolute bottom-10 right-1/4 w-64 h-64 rounded-full bg-gradient-to-tr from-green-300/30 to-teal-500/30 blur-xl"></div>
      </div>
      
      <nav className="relative z-10 w-full px-6 py-4">
        <Link to="/" className="flex flex-col items-center md:items-start">
          <span className="text-3xl font-bold text-white tracking-tight">PBC</span>
          <span className="text-xs font-light text-white/80 -mt-1">Pak Bazaar Connect</span>
        </Link>
      </nav>
      
      <div className="container flex-grow mx-auto px-4 py-8 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md backdrop-blur-sm bg-white/90 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input-field"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-200 shadow-sm transition-all hover:bg-gradient-to-r hover:from-pakistani-green-600 hover:to-blue-600 hover:text-white group"
                disabled={isLoading}
              >
                <span className="group-hover:animate-pulse">
                  {isLoading ? 'Logging in...' : 'Login'}
                </span>
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline font-medium">
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
                  className="transition-all hover:bg-gradient-to-r hover:from-pakistani-green-600 hover:to-blue-600 hover:text-white hover:border-transparent"
                >
                  Admin
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('wholesaler1@test.com', 'password')}
                  disabled={isLoading}
                  className="transition-all hover:bg-gradient-to-r hover:from-pakistani-green-600 hover:to-blue-600 hover:text-white hover:border-transparent"
                >
                  Wholesaler
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('seller1@test.com', 'password')}
                  disabled={isLoading}
                  className="transition-all hover:bg-gradient-to-r hover:from-pakistani-green-600 hover:to-blue-600 hover:text-white hover:border-transparent"
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
