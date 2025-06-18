
import React, { useState } from 'react';
import { signIn } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Crown, Eye, EyeOff, Shield } from 'lucide-react';

interface AdminLoginFormProps {
  onBackToRegular: () => void;
}

const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onBackToRegular }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { checkAuthStatus } = useAuth();
  const navigate = useNavigate();

  // Only khizerfight@gmail.com is allowed admin access
  const ADMIN_EMAIL = 'khizerfight@gmail.com';

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict email validation
    if (email.toLowerCase() !== ADMIN_EMAIL) {
      toast({
        title: 'Access Denied',
        description: 'This email is not authorized for admin access. Only the platform owner can access admin features.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await signIn(email, password);
      await checkAuthStatus();
      
      toast({
        title: 'Admin Access Granted',
        description: 'Welcome back, Administrator! You have full platform access.',
        duration: 3000
      });
      
      // Small delay to show success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast({
        title: 'Admin Login Failed',
        description: error.message || 'Invalid admin credentials. Please check your password.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="bg-gradient-to-r from-red-500 to-orange-600 dark:from-red-800 dark:to-orange-700 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
          <Crown className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-foreground font-poppins">Admin Portal</h2>
        <p className="text-muted-foreground font-poppins mt-2">Secure administrator access</p>
        <div className="flex items-center justify-center mt-3 space-x-2">
          <Shield className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-600 font-medium font-poppins">Restricted Access</span>
        </div>
      </div>

      <form onSubmit={handleAdminLogin} className="space-y-4">
        <div>
          <label htmlFor="admin-email" className="block text-sm font-medium text-foreground mb-2 font-poppins">
            Admin Email
          </label>
          <Input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="khizerfight@gmail.com"
            className="w-full font-poppins bg-background dark:bg-background"
            disabled={isLoading}
            required
          />
          <p className="text-xs text-gray-500 mt-1 font-poppins">
            Only khizerfight@gmail.com has admin privileges
          </p>
        </div>

        <div>
          <label htmlFor="admin-password" className="block text-sm font-medium text-foreground mb-2 font-poppins">
            Admin Password
          </label>
          <div className="relative">
            <Input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full pr-10 font-poppins bg-background dark:bg-background"
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-poppins shadow-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Authenticating...
            </div>
          ) : (
            <>
              <Crown className="h-4 w-4 mr-2" />
              Access Admin Panel
            </>
          )}
        </Button>
      </form>

      <div className="text-center">
        <button
          onClick={onBackToRegular}
          className="text-sm text-pakistani_green-600 dark:text-pakistani_green-400 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 font-poppins transition-colors"
          disabled={isLoading}
        >
          ← Back to Regular Login
        </button>
      </div>

      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200 font-poppins mb-1">
              Security Notice
            </p>
            <p className="text-xs text-red-700 dark:text-red-300 font-poppins">
              Admin access is restricted to the platform owner only. This ensures maximum security 
              and prevents unauthorized access to sensitive platform controls.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginForm;
