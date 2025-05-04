
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, LogIn, Mail, Key } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkAuthStatus } = useAuth();

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
      const result = await signIn(email, password);
      console.log('Login result:', result);
      await checkAuthStatus();
      console.log('Auth status checked');
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 flex flex-col">
      {/* Top Banner */}
      <div className="bg-pakistani_green-700 text-white py-2 px-4 text-center relative overflow-hidden">
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
              <CardDescription className="text-green-50">Log in to your account</CardDescription>
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
                    <Mail className="h-4 w-4 mr-1 text-pakistani_green-700" />
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
                    <Key className="h-4 w-4 mr-1 text-pakistani_green-700" />
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
                  {isLoading ? 'Logging In...' : 'Log In'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-center p-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-pakistani_green-700 hover:text-pakistani_green-800 font-medium">
                  Sign Up Here
                </Link>
              </p>
            </CardFooter>
          </Card>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Demo Accounts:</p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                <p className="font-semibold">Admin</p>
                <p>admin@test.com</p>
                <p className="text-gray-400">password</p>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                <p className="font-semibold">Wholesaler</p>
                <p>wholesaler1@test.com</p>
                <p className="text-gray-400">password</p>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                <p className="font-semibold">Seller</p>
                <p>seller1@test.com</p>
                <p className="text-gray-400">password</p>
              </div>
            </div>
          </div>
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
