
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill out all fields',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
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
    <div className="min-h-screen flex flex-col bg-gradient-to-bl from-pakistani-green-800 via-blue-600 to-yellow-400 relative overflow-hidden">
      {/* Abstract shapes in the background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-tl from-yellow-300/30 to-orange-500/30 blur-xl"></div>
        <div className="absolute top-1/3 -right-24 w-72 h-72 rounded-full bg-gradient-to-bl from-blue-300/30 to-purple-500/30 blur-xl"></div>
        <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full bg-gradient-to-tr from-green-300/30 to-teal-500/30 blur-xl"></div>
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
              <h2 className="text-2xl font-bold text-gray-800">Create an Account</h2>
              <p className="text-gray-600 mt-2">Join Pak Bazaar Connect to connect with wholesalers and sellers</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
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
                  placeholder="Create a password"
                  className="input-field"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="input-field"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-200 shadow-sm transition-all hover:bg-gradient-to-r hover:from-pakistani-green-600 hover:to-blue-500 hover:text-white group"
                disabled={isLoading}
              >
                <span className="group-hover:animate-pulse">
                  {isLoading ? 'Signing up...' : 'Sign Up'}
                </span>
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
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
