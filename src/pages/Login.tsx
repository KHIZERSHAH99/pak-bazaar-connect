
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogIn, AlertCircle, UserCheck, ShieldCheck, Flag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const {
    checkAuthStatus
  } = useAuth();
  const {
    toast
  } = useToast();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Logging in with:', { email });
      await signIn(email, password);
      await checkAuthStatus();
      toast({
        title: 'Success',
        description: 'You have successfully logged in'
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials and try again');
      toast({
        title: 'Login failed',
        description: error.message || 'Please check your credentials and try again',
        variant: 'destructive'
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
      console.log('Quick login with:', { email });
      await signIn(email, password);
      await checkAuthStatus();
      toast({
        title: 'Success',
        description: 'You have successfully logged in'
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Quick login error:', error);
      setError(error.message || 'Login failed. Please check your connection and try again');
      toast({
        title: 'Login failed',
        description: error.message || 'Please check your connection and try again',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 flex flex-col">
      {/* Top Banner */}
      <div className="bg-pakistani_green-700 text-white py-2 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Flag className="w-40 h-40 text-white" />
        </div>
        <p className="font-medium text-sm md:text-base">Join Now! Free Ads for First 10 Wholesalers!</p>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <div className="bg-pakistani_green-700 rounded-xl p-2 shadow-md">
              <span className="text-white text-2xl font-bold">PBC</span>
            </div>
            <span className="ml-2 text-xl font-bold text-pakistani_green-800 hidden md:inline">
              Pak Bazaar Connect
            </span>
          </Link>
          
          <nav className="flex items-center space-x-2">
            <Link to="/signup" className="text-sm font-medium text-pakistani_green-700 hover:text-pakistani_green-800 hidden md:inline">
              Don't have an account?
            </Link>
            <Link to="/signup">
              <Button variant="outline" size="sm" className="border-pakistani_green-700 text-pakistani_green-700 hover:bg-pakistani_green-50">
                Sign Up
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto flex-grow py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-pakistani_green-700 text-white text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
                  <LogIn className="h-8 w-8" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription className="text-green-50">Sign in to access your account</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {error && (
                <div className="mb-6 p-3 bg-red-50 rounded-lg flex items-center text-red-600 text-sm border border-red-100">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center">
                    <UserCheck className="h-4 w-4 mr-1 text-pakistani_green-700" />
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full p-3 bg-white border border-gray-300 rounded-md focus-visible:ring-pakistani_green-500"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-1 text-pakistani_green-700" />
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full p-3 bg-white border border-gray-300 rounded-md focus-visible:ring-pakistani_green-500"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-pakistani_green-700 hover:bg-pakistani_green-800 text-white font-medium py-3 px-4 rounded-md shadow-sm transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="border-t border-gray-100 bg-gray-50 flex flex-col p-4 gap-4">
              <p className="text-sm text-gray-600 text-center">
                Don't have an account?{' '}
                <Link to="/signup" className="text-pakistani_green-700 hover:text-pakistani_green-800 font-medium">
                  Sign Up
                </Link>
              </p>

              {/* Quick login for demo purposes */}
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">Demo Accounts</h3>
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
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-pakistani_green-800 text-white py-4 px-6">
        <div className="container mx-auto text-center text-sm">
          <p>Build Successful, API Keys Secured</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
