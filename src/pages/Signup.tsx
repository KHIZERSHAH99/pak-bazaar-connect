
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, AlertCircle } from 'lucide-react';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill out all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);
      await signUp(email, password);
      
      toast({
        title: 'Account created',
        description: 'You can now login with your new account',
      });
      
      navigate('/login');
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'An error occurred while creating your account');
      toast({
        title: 'Sign up failed',
        description: error.message || 'An error occurred while creating your account',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-bl from-pakistani_green-800 via-pakistani_green-700 to-pakistani_green-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="grid-signup" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-signup)" />
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
                  <UserPlus className="h-8 w-8 text-pakistani_green-700" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Create an Account</h2>
              <p className="text-gray-600 mt-2">Join Pak Bazaar Connect to connect with wholesalers and sellers</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center text-red-600 text-sm">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-6">
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
                  placeholder="Create a password"
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pakistani_green-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pakistani_green-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-pakistani_green-700 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:bg-pakistani_green-800 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Signing up...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-pakistani_green-700 hover:underline font-medium">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
