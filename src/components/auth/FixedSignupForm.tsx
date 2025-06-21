
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextFixed';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Mail, Key, User, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserRole } from '@/lib/types';

const FixedSignupForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('seller');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, role);
      
      if (error) {
        throw new Error(error);
      }

      // Redirect to login page after successful signup
      navigate('/login');
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Signup failed. Please try again.');
    }finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-lg">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">Create Account</h1>
          <p className="text-gray-600 mt-2 font-poppins">Join our B2B marketplace</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-center text-red-600 text-sm border border-red-100">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-pakistani_green-500 focus:border-pakistani_green-500 font-poppins"
              disabled={isLoading}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 flex items-center font-poppins">
              <User className="h-4 w-4 mr-1 text-pakistani_green-700" />
              Account Type
            </label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)} disabled={isLoading}>
              <SelectTrigger className="w-full p-3 border border-gray-300 rounded-md focus:ring-pakistani_green-500 focus:border-pakistani_green-500 font-poppins">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seller">Seller - Buy wholesale products</SelectItem>
                <SelectItem value="wholesaler">Wholesaler - Sell to retailers</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 flex items-center font-poppins">
              <Key className="h-4 w-4 mr-1 text-pakistani_green-700" />
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3 pr-10 border border-gray-300 rounded-md focus:ring-pakistani_green-500 focus:border-pakistani_green-500 font-poppins"
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 flex items-center font-poppins">
              <Key className="h-4 w-4 mr-1 text-pakistani_green-700" />
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full p-3 pr-10 border border-gray-300 rounded-md focus:ring-pakistani_green-500 focus:border-pakistani_green-500 font-poppins"
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-pakistani_green-700 hover:bg-pakistani_green-800 text-white font-medium py-3 px-4 rounded-md shadow-sm transition-colors font-poppins"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="border-t border-gray-200 bg-gray-50 flex justify-center p-4">
        <p className="text-sm text-gray-600 font-poppins">
          Already have an account?{' '}
          <Link to="/login" className="text-pakistani_green-700 hover:text-pakistani_green-800 font-medium">
            Sign In Here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default FixedSignupForm;
